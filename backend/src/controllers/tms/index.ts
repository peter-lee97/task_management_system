import { Request, Response } from "express";
import { Task_State } from "../../constants";
import {
  isPlanValid,
  isTaskValid,
  TaskInsert,
  TaskUpdate,
  type Application,
  type ApplicationUpdate,
  type Plan,
  type Task,
} from "../../model";
import { getDb, TMSDB, UserGroupDB } from "../../services/db";
import { verifyToken } from "../../services/jwt";

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
  const newApplication: ApplicationUpdate = req.body;

  if (!newApplication) {
    res
      .status(400)
      .json({ message: "Invalid input parameter for updating application" });
    return;
  }

  const db = getDb();

  const existingApplication = await TMSDB.fetchApplication(
    db,
    newApplication.App_Acronym
  );

  if (!existingApplication) {
    res.status(400).json({ message: "application not found" });
    return;
  }

  console.log(`from res body: ${JSON.stringify(newApplication)}`);

  try {
    await TMSDB.updateApplication(db, {
      ...existingApplication,
      App_Rnumber:
        newApplication.App_Rnumber !== undefined
          ? newApplication.App_Rnumber
          : existingApplication.App_Rnumber,
      App_startDate:
        newApplication.App_startDate !== undefined
          ? newApplication.App_startDate
          : existingApplication.App_startDate,
      App_endDate:
        newApplication.App_endDate !== undefined
          ? newApplication.App_endDate
          : existingApplication.App_endDate,
      App_Description:
        newApplication.App_Description !== undefined
          ? newApplication.App_Description
          : existingApplication.App_Description,
      App_permit_Open:
        newApplication.App_permit_Open !== undefined
          ? newApplication.App_permit_Open
          : existingApplication.App_permit_Open,
      App_permit_toDoList:
        newApplication.App_permit_toDoList !== undefined
          ? newApplication.App_permit_toDoList
          : existingApplication.App_permit_toDoList,
      App_permit_Doing:
        newApplication.App_permit_Doing !== undefined
          ? newApplication.App_permit_Doing
          : existingApplication.App_permit_Doing,
      App_permit_Done:
        newApplication.App_permit_Done !== undefined
          ? newApplication.App_permit_Done
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

/**
 * Require to pass in `appAcronym` as param
 * @param req
 * @param res
 * @returns
 */
export const fetchApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("[fetchApplication]");

  const db = getDb();
  const appAcronym = req.params.appAcronym as string | null;
  if (appAcronym == null) {
    res.status(400).json({ message: "missing appAcronym parameter" });
    return;
  }
  const fetchApp = await TMSDB.fetchApplication(db, appAcronym);
  res.status(200).json({ message: "success", result: fetchApp });
  return;
};

export const fetchAllApplications = async (req: Request, res: Response) => {
  console.log(`[fetchAllApplications]`);

  const db = getDb();
  try {
    const apps = await TMSDB.fetchAllApplications(db);
    return res.status(200).json({ message: "successful", result: apps });
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

  console.log("exist plan: ", existPlan != null);

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
  res.status(200).json({ message: "success", result: result });
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

  const { appAcronym } = req.params;
  console.log(`fetching plans for app: ${appAcronym}`);
  const mvpName = req.query.mvpName as string | null;
  if (appAcronym == null) {
    res.status(400).json({ message: "appAcronym field param missing" });
    return;
  }

  const db = getDb();
  if (mvpName != null) {
    console.log(`plan mvp name: ${mvpName}`);
    const plan = await TMSDB.fetchPlanByAppAndMVP(db, appAcronym, mvpName);
    if (plan) {
      res.status(200).json({ message: "success", result: plan });
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
  const appAcronym = req.params.appAcronym;
  if (appAcronym == undefined) {
    res.status(400).json({ message: "appAcronym field param missing" });
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
    await TMSDB.createTask(db, insertTask);
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

  let existingNotes = "";

  if (existingTask.Task_notes != null && existingTask.Task_notes != undefined) {
    existingNotes = existingTask.Task_notes;
  }

  try {
    await TMSDB.updateTask(db, {
      ...(updateTask.Task_notes !== undefined
        ? {
            Task_notes: existingNotes + `${updateTask.Task_notes}\n`,
          }
        : undefined),
      ...updateTask,
      Task_owner: payload.username,
    });
    const updatedTask = await TMSDB.fetchTask(db, updateTask.Task_id);
    if (!updatedTask) {
      throw "failed to fetch task";
    }
    res.status(200).json({ message: "success", result: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to update task" });
    return;
  }
};

export const checkActions = async (req: Request, res: Response) => {
  console.log("[checkActions]");
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
  const taskId = req.query.taskId as string;
  if (!taskId) {
    res.status(400).json({ message: "Missing field, taskId required" });
    return;
  }
  const db = getDb();
  const task = await TMSDB.fetchTask(db, taskId);
  if (!task) {
    res.status(400).json({ message: "Task not found" });
    return;
  }
  const app = await TMSDB.fetchApplication(db, task.Task_app_Acronym);
  if (!app) {
    res.status(400).json({ message: "App not found" });
    return;
  }

  // Return the possible state use can change
  const promoteAction: string[] = [];
  const demoteAction: string[] = [];

  // who can promote
  if (
    app.App_permit_Open &&
    (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Open)) &&
    task.Task_state == Task_State.OPEN
  ) {
    promoteAction.push(Task_State.TODO);
  }
  if (
    app.App_permit_toDoList &&
    (await UserGroupDB.Checkgroup(payload.username, app.App_permit_toDoList)) &&
    task.Task_state == Task_State.TODO
  ) {
    promoteAction.push(Task_State.DOING);
  }

  if (
    app.App_permit_Doing &&
    (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Doing)) &&
    task.Task_state == Task_State.DOING
  ) {
    promoteAction.push(Task_State.DONE);
  }

  if (
    app.App_permit_Done &&
    (await UserGroupDB.Checkgroup(payload.username, app.App_permit_Done)) &&
    task.Task_state == Task_State.DONE
  ) {
    promoteAction.push(Task_State.CLOSE);
    demoteAction.push(Task_State.DOING);
  }

  res.status(200).json({
    message: "success",
    promote: promoteAction,
    demote: demoteAction,
    currentTaskState: task.Task_state,
  });
};
