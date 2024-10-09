import { Router } from "express";
import { Account, Application, Task, Task_State } from "../../model";
import { AccountDB, getDb, TMSDB, UserGroupDB } from "../../services/db";
import { compareHash } from "../../services/jwt";
import { getTransporter, sendMail } from "../../services/nodemailer";
import { generateSystemNotes } from "../../services/utils";
import { MsgCode } from "./constant";

const router = Router();

router.use((req, res, next) => {
  console.log(`req.originalUrl: ${req.originalUrl}`);
  const validUrls: string[] = [
    "/api/demo/CreateTask",
    "/api/demo/GetTaskbyState",
    "/api/demo/PromoteTask2Done",
  ];
  if (Object.keys(req.query).length != 0) {
    res.status(400).json({ msgCode: MsgCode.INVALID_PARAMETER });
    return;
  }

  const url = req.originalUrl;

  console.log("incoming url:", url);

  let isValidUrl = false;

  for (const i of validUrls) {
    if (i.toLowerCase() === url.toLowerCase()) {
      isValidUrl = true;
      break;
    }
  }

  if (isValidUrl) {
    next();
    return;
  }

  res.status(400).json({ msgCode: MsgCode.INVALID_URL });
  return;
});

router.post("/CreateTask", async (req, res) => {
  console.log("[CreateTask]");

  const allowedFields = [
    "username",
    "password",
    "appAcronym",
    "taskName",
    "taskNotes",
    "description",
    "taskPlan",
  ];
  const bodyFields = Object.keys(req.body);
  const hasExtraFields = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );
  if (hasExtraFields) {
    return res.status(400).json({ msgCode: MsgCode.INVALID_KEY });
  }

  const {
    username,
    password,
    appAcronym,
    taskName,
    description,
    taskNotes,
    taskPlan,
  } = req.body;

  if (!username || !password) {
    res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    return;
  }
  if (
    !appAcronym ||
    !taskName ||
    (taskName as string).length < 0 ||
    (taskName as string).length > 255
  ) {
    res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    return;
  }

  if (description.length > 2 ** 16 - 1) {
    res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    return;
  }

  const db = getDb();
  let account: Account | null;
  try {
    account = await AccountDB.fetchUser(db, username);
    if (!account) throw "account not found";
    if (account.accountStatus != "active") throw "account not active";
    const pwMatch = await compareHash(password, account.password);
    if (!pwMatch) throw "password not matched";
  } catch (error) {
    console.error(error);
    res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
    return;
  }

  try {
    await db.query("START TRANSACTION");
    const application = await TMSDB.fetchApplication(db, appAcronym);
    if (!application) {
      res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
      return;
    }
    if (!application.App_permit_Create) {
      res.status(403).json({ msgCode: MsgCode.NOT_AUTHORIZED });
      return;
    }

    const hasPermission = await UserGroupDB.Checkgroup(
      username,
      application.App_permit_Create
    );

    if (!hasPermission) {
      return res.status(403).json({ msgCode: MsgCode.NOT_AUTHORIZED });
    }

    if (taskPlan) {
      const plans = await TMSDB.fetchPlansByApp(db, application.App_Acronym);
      const selectedPlan = plans.filter((p) => p.Plan_MVP_name == taskPlan);

      // Plan not found
      if (selectedPlan.length == 0) {
        console.error("plan not found in app");
        res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
        return;
      }
    }

    const Task_id = `${application.App_Acronym}_${application.App_Rnumber + 1}`;
    let newNotes = generateSystemNotes({
      username: username,
      currentState: Task_State.OPEN,
    });
    if (taskNotes != null && taskNotes != undefined) {
      newNotes = `${taskNotes}\n` + newNotes;
    }
    if (newNotes.length > 2 ** 24 - 1) {
      //check taskNotes within allowable limit
      res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
      return;
    }
    const task: Task = {
      Task_id,
      Task_app_Acronym: application.App_Acronym,
      Task_createDate: Date.now() / 1000,
      Task_creator: username,
      Task_owner: username,
      Task_description: description ?? null,
      Task_name: taskName,
      Task_state: Task_State.OPEN,
      Task_notes: newNotes,
      Task_plan: taskPlan,
      constructor: { name: "RowDataPacket" },
    };
    await TMSDB.createTask(db, task);
    await TMSDB.updateApplication(db, {
      App_Acronym: application.App_Acronym,
      App_Rnumber: application.App_Rnumber + 1,
    });
    await db.execute("COMMIT");
    res.status(200).json({
      result: { Task_id },
      msgCode: MsgCode.SUCCESS,
    });
    return;
  } catch (error) {
    console.error(error);
    await db.execute("ROLLBACK");
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }
});

router.post("/GetTaskbyState", async (req, res) => {
  console.log("[GetTaskbyState]");

  const allowedFields = ["username", "password", "appAcronym", "taskState"];
  const bodyFields = Object.keys(req.body);
  const hasExtraFields = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );
  if (hasExtraFields) {
    return res.status(400).json({ msgCode: MsgCode.INVALID_KEY });
  }
  const { username, password, taskState, appAcronym } = req.body;
  if (!username || !password) {
    res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    return;
  }
  if (!taskState || !appAcronym) {
    res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    return;
  }
  const taskStates = ["open", "todo", "doing", "done", "closed"];

  const isInclude = taskStates.filter((e) => e === taskState);
  if (isInclude.length == 0) {
    res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
    return;
  }

  const db = getDb();
  let account: Account | null;
  try {
    account = await AccountDB.fetchUser(db, username);
    if (!account) throw "account not found";
    if (account.accountStatus != "active") {
      res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
      return;
    }
    const pwMatch = await compareHash(password, account.password);
    if (!pwMatch) {
      res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }
  let app: Application | null;
  try {
    app = await TMSDB.fetchApplication(db, appAcronym);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }
  if (app == null) {
    res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
    return;
  }

  try {
    const tasks = await TMSDB.fetchTasksByApp(db, app.App_Acronym);
    const tasksInState = tasks.filter((t) => t.Task_state == taskState);
    res.status(200).json({
      result: tasksInState,
      msgCode: MsgCode.SUCCESS,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
  }
});

router.post("/PromoteTask2Done", async (req, res) => {
  console.log("[PromoteTask2Done]");

  const allowedFields = [
    "username",
    "password",
    "appAcronym",
    "taskName",
    "taskNotes",
    "taskId",
  ];
  const bodyFields = Object.keys(req.body);
  const hasExtraFields = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );
  if (hasExtraFields) {
    return res.status(400).json({ msgCode: MsgCode.INVALID_KEY });
  }
  const { username, password, taskId, appAcronym, taskNotes } = req.body;
  if (!username || !password) {
    res.status(401).json({
      msgCode: MsgCode.NOT_AUTHORIZED,
    });
    return;
  }
  if (!taskId || !appAcronym) {
    res.status(400).json({
      msgCode: MsgCode.INVALID_INPUT,
    });
    return;
  }
  const db = getDb();
  let account: Account | null;
  try {
    account = await AccountDB.fetchUser(db, username);
    if (!account) throw "account not found";
    if (account.accountStatus != "active") {
      res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
      return;
    }
    const pwMatch = await compareHash(password, account.password);
    if (!pwMatch) {
      res.status(401).json({ msgCode: MsgCode.INVALID_CREDENTIALS });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }
  let app: Application | null;
  try {
    app = await TMSDB.fetchApplication(db, appAcronym);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }
  if (app == null) {
    console.error("app not found");
    res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
    return;
  }
  if (!app.App_permit_Doing) {
    console.error("permit done does not have group");
    res.status(403).json({ msgCode: MsgCode.NOT_AUTHORIZED });
    return;
  }
  const isValid = await UserGroupDB.Checkgroup(
    account.username,
    app.App_permit_Doing
  );
  if (!isValid) {
    console.error("user not belong in permit doing");
    res.status(403).json({
      msgCode: MsgCode.NOT_AUTHORIZED,
    });
    return;
  }
  let task: Task | null;
  try {
    task = await TMSDB.fetchTask(db, taskId);
    if (task == null) {
      console.error(`task not found: ${taskId}`);
      res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
      return;
    }
    if (
      task.Task_app_Acronym.toLowerCase() !=
      (appAcronym as string).toLowerCase()
    ) {
      console.log(
        `task do not belong in app acronym. ${task.Task_app_Acronym}  | ${appAcronym}`
      );
      res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
      return;
    }

    if (task.Task_state != Task_State.DOING) {
      console.error("invalid state change, previous state not doing");
      res.status(400).json({ msgCode: MsgCode.INVALID_STATE_CHANGE });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }
  let updatedTask: Task | null;
  try {
    let newNotes =
      generateSystemNotes({
        username,
        currentState: Task_State.DONE,
      }) + task.Task_notes;
    if (taskNotes) {
      newNotes = `${taskNotes}\n` + newNotes;
    }
    if (newNotes.length > 2 ** 24 - 1) {
      //check taskNotes within allowable limit
      res.status(400).json({ msgCode: MsgCode.INVALID_INPUT });
      return;
    }

    await db.query("START TRANSACTION");
    await TMSDB.updateTask(db, {
      ...task,
      Task_state: Task_State.DONE,
      Task_notes: newNotes,
    });
    updatedTask = await TMSDB.fetchTask(db, task.Task_id);
    await db.execute("COMMIT");
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error(error);
    res.status(500).json({ msgCode: MsgCode.INTERNAL });
    return;
  }

  if (!updatedTask) {
    res.status(400).json({ msgCode: MsgCode.NOT_FOUND });
    return;
  }

  const permitDoneGroup = app.App_permit_Done;
  if (permitDoneGroup) {
    UserGroupDB.fetchByGroupname(db, permitDoneGroup).then(async (value) => {
      const p = value
        .map((e) => e.username)
        .map((u) => AccountDB.fetchUser(db, u));
      const r = await Promise.allSettled(p);
      const accounts = r
        .filter((e) => e.status === "fulfilled")
        .map((e) => e.value)
        .filter((e) => e != null);
      console.log(`accounts: ${accounts.length}`);
      sendMail(
        getTransporter,
        accounts,
        {
          email: "tms@service.com",
          username: "tms service",
        },
        `[${app.App_Acronym}] Task Completion`,
        `Dear PLs,  \n${updatedTask.Task_owner} has completed task ${updatedTask.Task_id}.\n\n-- This is a system generated email. DO NOT REPLY --\nRegards, \nTMS service`
      );
    });
  }

  res.status(200).json({
    result: {
      Task_id: updatedTask.Task_id,
      Task_state: updatedTask.Task_state,
    },
    msgCode: MsgCode.SUCCESS,
  });
  return;
});

export default router;
