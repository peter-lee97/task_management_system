import { Request, Response } from "express";
import {
  isPlanValid,
  isTaskValid,
  Permits,
  Task_State,
  TaskInsert,
  TaskUpdate,
  type Application,
  type ApplicationUpdate,
  type Plan,
  type Task,
} from "../../model";
import { getDb, TMSDB, UserGroupDB } from "../../services/db";
import { fetchUser } from "../../services/db/account";
import { fetchAllApplications, fetchApplication } from "../../services/db/tms";
import { fetchByGroupname } from "../../services/db/user_group";
import { verifyToken } from "../../services/jwt";
import { getTransporter, sendMail } from "../../services/nodemailer";
import { generateSystemNotes } from "../../services/utils";

export const createApp = async (req: Request, res: Response): Promise<void> => {
  console.log(`[createApp]`);

  const db = getDb();
  const newApp: Application = req.body;

  if (!newApp) {
    res
      .status(400)
      .json({ message: "Invalid input parameter for creating application." });
    return;
  }

  if (newApp.App_Rnumber > 2 ** 8) {
    res.status(400).json({
      message: `App_Rnumber cannot be greater than ${newApp.App_Rnumber}`,
    });
    return;
  }

  // check if exists
  const appExists = await TMSDB.checkApplicationExists(db, newApp.App_Acronym);

  if (appExists) {
    res.status(400).json({ message: "App_Acronym already exists" });
    return;
  }
  try {
    await TMSDB.createApplication(db, newApp);
    const newCreateApp = await TMSDB.fetchApplication(db, newApp.App_Acronym);
    if (!newCreateApp) throw "new createApp not found";

    res.status(200).json({ message: "successful", result: newCreateApp });
    return;
  } catch (error) {
    console.error(`error createApp: ${error}`);
    res.status(500).json({ message: "Failed to create an application" });
    return;
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  console.log("[updateApplication]");
  const newAppUpdate: ApplicationUpdate = req.body;

  if (!newAppUpdate) {
    res
      .status(400)
      .json({ message: "Invalid input parameter for updating application" });
    return;
  }

  const db = getDb();

  const existingApplication = await TMSDB.fetchApplication(
    db,
    newAppUpdate.App_Acronym
  );

  if (!existingApplication) {
    res.status(400).json({ message: "application not found" });
    return;
  }

  try {
    await TMSDB.updateApplication(db, {
      ...existingApplication,

      App_Rnumber:
        newAppUpdate.App_Rnumber !== undefined
          ? newAppUpdate.App_Rnumber
          : existingApplication.App_Rnumber,
      App_startDate:
        newAppUpdate.App_startDate !== undefined
          ? newAppUpdate.App_startDate
          : existingApplication.App_startDate,
      App_endDate:
        newAppUpdate.App_endDate !== undefined
          ? newAppUpdate.App_endDate
          : existingApplication.App_endDate,
      App_Description:
        newAppUpdate.App_Description !== undefined
          ? newAppUpdate.App_Description
          : existingApplication.App_Description,
      App_permit_Create:
        newAppUpdate.App_permit_Create !== undefined
          ? newAppUpdate.App_permit_Create
          : existingApplication.App_permit_Create,
      App_permit_Open:
        newAppUpdate.App_permit_Open !== undefined
          ? newAppUpdate.App_permit_Open
          : existingApplication.App_permit_Open,
      App_permit_toDoList:
        newAppUpdate.App_permit_toDoList !== undefined
          ? newAppUpdate.App_permit_toDoList
          : existingApplication.App_permit_toDoList,
      App_permit_Doing:
        newAppUpdate.App_permit_Doing !== undefined
          ? newAppUpdate.App_permit_Doing
          : existingApplication.App_permit_Doing,
      App_permit_Done:
        newAppUpdate.App_permit_Done !== undefined
          ? newAppUpdate.App_permit_Done
          : existingApplication.App_permit_Done,
    });
    const updatedApplication = await TMSDB.fetchApplication(
      db,
      existingApplication.App_Acronym
    );
    res.status(200).json({ message: "success", result: updatedApplication });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to update application" });
  }
};

export const fetchUserApplications = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized to access routes" });
    return;
  }
  const payload = verifyToken(token, process.env.ENV_SECRET as string);
  if (!payload) {
    res.status(401).json({ message: "Unauthorized to access routes" });
    return;
  }
  const db = getDb();
  try {
    const apps = await fetchAllApplications(db);
    return res.status(200).json({ message: "success", result: apps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch applications by user" });
  }
};

export const fetchApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { appAcronym } = req.body;
  const db = getDb();
  if (appAcronym) {
    console.log("[fetchApplication]");
    try {
      const fetchApp = await TMSDB.fetchApplication(db, appAcronym);
      res.status(200).json({ message: "successful", result: fetchApp });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch application" });
    }

    return;
  }
  console.log(`[fetchAllApplications]`);
  try {
    const apps = await TMSDB.fetchAllApplications(db);
    res.status(200).json({ message: "successful", result: apps });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all applications" });
  }
};

/**
 * Takes in `Plan` fields as the req params
 * @param req
 * @param res
 * @returns
 */
export const createPlan = async (req: Request, res: Response) => {
  console.log(`[createPlan]`);

  const newPlan = req.body as Plan | null;
  if (newPlan == null) {
    res.status(400).json({ message: "missing arguments for creating plan" });
    return;
  }

  const errorMessage = isPlanValid(newPlan);
  if (errorMessage) {
    res.status(400).json({ message: errorMessage });
    return;
  }

  console.log(`plan: ${JSON.stringify(newPlan)}`);

  const db = getDb();
  const existPlan = await TMSDB.fetchPlanByAppAndMVP(
    db,
    newPlan.Plan_app_Acronym,
    newPlan.Plan_MVP_name
  );

  if (existPlan != null) {
    res
      .status(400)
      .json({ message: "Plan MVP title exists, please use another name" });
    return;
  }

  const fetchApp = await TMSDB.fetchApplication(db, newPlan.Plan_app_Acronym);
  if (!fetchApp) {
    res.status(400).json({ message: "Invalid input. App Acronym not found" });
    return;
  }
  const fetchPlan = await TMSDB.fetchPlanByAppAndMVP(
    db,
    newPlan.Plan_app_Acronym,
    newPlan.Plan_MVP_name
  );

  if (fetchPlan) {
    res
      .status(400)
      .json({ message: "Invalid input. Plan MVP name is not available" });
    return;
  }
  await TMSDB.createPlan(db, newPlan);
  const result = await TMSDB.fetchPlan(db, newPlan.Plan_MVP_name);
  if (result == null) {
    res.status(400).json({ message: "failed to create plan" });
    return;
  }
  res.status(200).json({ message: "success", result });
};

/**
 * Require `appAcronym` as param and
 * `mvpName` as optional query
 * @param req
 * @param res
 * @returns
 */
export const fetchPlans = async (req: Request, res: Response) => {
  console.log(`[fetchPlan]`);

  const { appAcronym, mvpName } = req.body;
  console.log(`fetching plans for app: ${appAcronym}`);

  if (appAcronym == null) {
    res.status(400).json({ message: "appAcronym field param missing" });
    return;
  }

  const db = getDb();
  if (mvpName != null) {
    console.log(`plan mvp name: ${mvpName}`);
    const plan = await TMSDB.fetchPlanByAppAndMVP(db, appAcronym, mvpName);
    if (plan) {
      res.status(200).json({ message: "success", result: [plan] });
      return;
    } else {
      res.status(400).json({ message: `Plan:${mvpName} not found` });
      return;
    }
  }
  try {
    const plans = await TMSDB.fetchPlansByApp(db, appAcronym);
    return res.status(200).json({ message: "success", result: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to fetch plans" });
  }
};

export const fetchAllTasks = async (req: Request, res: Response) => {
  const appAcronym = req.body.appAcronym;
  if (!appAcronym) {
    res.status(400).json({ message: "appAcronym field missing in req body" });
    return;
  }
  const db = getDb();
  try {
    const tasks = await TMSDB.fetchTasksByApp(db, appAcronym);
    return res.status(200).json({ message: "success", result: tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to fetch tasks" });
  }
};

/**
 * Increment `Application.Rnumber` when task is created successfully
 * @param req
 * @param res
 * @returns
 */
export const createTask = async (req: Request, res: Response) => {
  console.log("[createTask]");
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }
  const payload = verifyToken(token, process.env.ENV_SECRET as string);
  if (!payload) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }
  const newTask = req.body as TaskInsert;
  if (Object.keys(newTask).length == 0) {
    res.status(400).json({ message: "missing body for creating task" });
    return;
  }

  const errorMessage = isTaskValid(newTask);
  if (errorMessage) {
    res.status(400).json({ message: errorMessage });
    return;
  }

  const db = getDb();
  const app = await TMSDB.fetchApplication(db, newTask.Task_app_Acronym);
  if (app == null) {
    res.status(400).json({ message: "Application for the task not found" });
    return;
  }

  if (!app.App_permit_Create) {
    res.status(400).json({ message: "App_permit_Create is not set" });
    return;
  }

  const canCreateTask = await UserGroupDB.Checkgroup(
    payload.username,
    app.App_permit_Create
  );
  if (!canCreateTask) {
    res.status(400).json({ message: "user not authorized to create task" });
    return;
  }

  // check if plan exists in db
  if (newTask.Task_plan != null) {
    const existPlan = await TMSDB.fetchPlan(db, newTask.Task_plan);
    if (existPlan == null) {
      res.status(400).json({ message: "Plan not found in app" });
      return;
    }
  }

  const newTaskId = `${app.App_Acronym}_${app.App_Rnumber}`;
  console.log(`new task id: ${app.App_Acronym}`);

  const insertTask: Task = {
    Task_id: newTaskId,
    constructor: {
      name: "RowDataPacket",
    },
    ...newTask,
  };

  // Sanity check
  const existTask = await TMSDB.fetchTask(db, insertTask.Task_id);
  if (existTask != null) {
    res.status(400).json({ message: "Task entry already exists" });
    return;
  }
  // TODO: think about the commit and rollback for create task and update app
  try {
    const systemNotes = generateSystemNotes({
      username: insertTask.Task_creator,
      currentState: insertTask.Task_state,
    });

    await TMSDB.createTask(db, {
      ...insertTask,
      Task_notes:
        insertTask.Task_notes != null
          ? (insertTask.Task_notes += `\n${systemNotes}\n`)
          : `${systemNotes}\n`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to create task" });
    return;
  }
  try {
    await TMSDB.updateApplication(db, {
      ...app,
      App_Rnumber: app.App_Rnumber + 1,
    });
    const newTask = await TMSDB.fetchTask(db, newTaskId);
    res.status(200).json({ message: "success", result: newTask });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to create task" });
  }
};

/**
 * `task.Task_notes` only require new value to be added
 * @param req
 * @param res
 * @returns
 */
export const updateTask = async (req: Request, res: Response) => {
  console.log("[updateTask]");
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorize to access route" });
    return;
  }
  const payload = verifyToken(token, process.env.ENV_SECRET as string);
  if (payload == null) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }

  const updateTask = req.body as TaskUpdate;
  if (!updateTask) {
    res
      .status(400)
      .json({ message: "failed to update task. missing body in request" });
    return;
  }

  const db = getDb();
  const existingTask = await TMSDB.fetchTask(db, updateTask.Task_id);
  if (!existingTask) {
    res
      .status(400)
      .json({ message: `Task id: ${updateTask.Task_id} not found` });
    return;
  }

  if (existingTask.Task_state == Task_State.DONE) {
    if (updateTask.Task_plan && updateTask.Task_state == Task_State.DONE) {
      res.status(400).json({
        message:
          "Use 'Reject Task' instead of 'Save Changes' when plan is updated",
      });
      return;
    }
  }

  // change in task plan,
  if (updateTask.Task_plan != undefined) {
    if (
      existingTask.Task_state == Task_State.DONE &&
      updateTask.Task_state == Task_State.CLOSED
    ) {
      res.status(400).json({
        message:
          "Use 'Reject Task' instead of 'Save Changes' when plan is updated",
      });
      return;
    }
  }

  let existingNotes = existingTask.Task_notes ?? "";

  if (updateTask.Task_notes != undefined && updateTask.Task_notes != null) {
    // generate system notes
    const systemNotes = generateSystemNotes({
      username: payload.username,
      currentState: existingTask.Task_state,
    });
    existingNotes =
      `${updateTask.Task_notes}\n` + `${systemNotes}\n` + existingNotes;
  } else if (
    !updateTask.Task_notes &&
    updateTask.Task_state != existingTask.Task_state
  ) {
    // only state change
    existingNotes =
      `${generateSystemNotes({
        username: payload.username,
        currentState: updateTask.Task_state,
      })}\n` + existingNotes;
  }

  try {
    const _updateTask = {
      ...updateTask,
      Task_notes: existingNotes,
      Task_owner: payload.username, // TODO: special case for reject
    };
    await TMSDB.updateTask(db, _updateTask);
    const updatedTask = await TMSDB.fetchTask(db, updateTask.Task_id);
    if (updatedTask && updatedTask.Task_state == Task_State.DONE) {
      // notify groups in done
      fetchApplication(db, updatedTask.Task_app_Acronym).then(async (app) => {
        if (app == null) {
          console.error(`app: ${updatedTask.Task_app_Acronym} not found`);
          return;
        }
        if (app.App_permit_Done == null) {
          console.error(`app: ${app.App_Acronym} does not have a permit done`);
          return;
        }
        const groups = await fetchByGroupname(db, app.App_permit_Done);
        const userPromise = groups.map((e) => fetchUser(db, e.username));
        const userAccounts = await Promise.allSettled(userPromise);
        const withValidEmails = userAccounts
          .map((e, index) => {
            if (e.status == "rejected") {
              console.error(`failed to fetch user: ${e.reason} | ${index}`);
            } else if (e.status == "fulfilled") {
              if (e.value != null) return e.value;
            }
            return null;
          })
          .filter((e) => e != null)
          .filter((e) => e.email);

        sendMail(
          getTransporter,
          withValidEmails,
          {
            email: "tms@service.com",
            username: "tms service",
          },
          `[${app.App_Acronym}] Task Completion`,
          `Dear PLs,  \n${updatedTask.Task_owner} has completed task ${updatedTask.Task_id}.\n\n-- This is a system generated email. DO NOT REPLY --\nRegards, \nTMS service`
        );
      });
    }
    if (!updatedTask) throw "failed to fetch task";
    res.status(200).json({ message: "success", result: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to update task" });
    return;
  }
};

export const fetchActions = async (req: Request, res: Response) => {
  console.log("[fetchActions]");
  const token = req.cookies.token;
  if (!token) {
    res.status(400).json({ message: "Unauthorized to access route" });
    return;
  }
  const payload = verifyToken(token, process.env.ENV_SECRET as string);
  if (!payload) {
    res.status(400).json({ message: "Unauthorized to access route" });
    return;
  }
  // Return the possible state use can change
  const actions = new Set<string>();
  const { appAcronym } = req.body;

  if (appAcronym) {
    const db = getDb();
    const app = await TMSDB.fetchApplication(db, appAcronym);
    if (!app) {
      res.status(400).json({ message: "App not found" });
      return;
    }

    // who can promote
    if (
      app.App_permit_Create &&
      (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Create))
    ) {
      actions.add(Permits.CREATE_TASK);
    }
    if (
      app.App_permit_Open &&
      (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Open))
    ) {
      actions.add(Permits.OPEN);
    }
    if (
      app.App_permit_toDoList &&
      (await UserGroupDB.Checkgroup(payload.username, app.App_permit_toDoList))
    ) {
      actions.add(Permits.TODO);
    }

    if (
      app.App_permit_Doing &&
      (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Doing))
    ) {
      actions.add(Permits.DOING);
    }

    if (
      app.App_permit_Done &&
      (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Done))
    ) {
      actions.add(Permits.DONE);
    }
  }

  if (await UserGroupDB.Checkgroup(payload.username, "PL")) {
    actions.add(Permits.CREATE_APP);
  }
  if (await UserGroupDB.Checkgroup(payload.username, "PM")) {
    actions.add(Permits.CREATE_PLAN);
  }

  res.status(200).json({
    message: "success",
    result: Array.from(actions.values()),
  });
};
