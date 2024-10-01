import { NextFunction, Request, Response } from "express";

import { Task, Task_State } from "../../model";
import { getDb, TMSDB, UserGroupDB } from "../../services/db";
import { verifyToken } from "../../services/jwt";

/**
 * Request param should contain `appAcronym`
 *
 * Includes `ADMIN` group
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const belongsInApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appAcronym } = req.body;
  if (!appAcronym) {
    res.status(400).json({ message: "appAcronym key missing in req.body" });
    return;
  }

  const token = req.cookies.token as string | null;
  if (token == null) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }
  const payload = verifyToken(token, process.env.ENV_SECRET as string);
  if (payload == null) {
    res.status(401).json({ message: "Unauthorized to access route" });
    return;
  }

  const db = getDb();

  const app = await TMSDB.fetchApplication(db, appAcronym);
  if (app == null) {
    res.status(400).json({ message: `Application ${appAcronym} not found` });
    return;
  }

  const appGroups = new Set(
    [
      app.App_permit_Create,
      app.App_permit_Open,
      app.App_permit_toDoList,
      app.App_permit_Doing,
      app.App_permit_Done,
      "ADMIN",
    ].filter((e) => e != null)
  );

  let isAllowed = false;

  for await (const g of appGroups) {
    const inGroup = await UserGroupDB.Checkgroup(payload.username, g);
    if (inGroup) {
      isAllowed = inGroup;
      break;
    }
  }

  if (!isAllowed) {
    res
      .status(403)
      .json({ message: "User do not have the rights to view the application" });
    return;
  }
  next();
};

/**
 * Determines if the task can be updated based on the task state change
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const validateTaskChange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  const db = getDb();

  const newTask = req.body as Task;
  if (!newTask) {
    res.status(400).json({ message: "Invalid params for updating task" });
    return;
  }
  if (Object.keys(newTask).length == 0) {
    res.status(400).json({ message: "task fields missing" });
    return;
  }
  const existingTask = await TMSDB.fetchTask(db, newTask.Task_id);
  if (!existingTask) {
    res.status(400).json({ message: "No existing task found" });
    return;
  }

  const tmsApp = await TMSDB.fetchApplication(
    db,
    existingTask.Task_app_Acronym
  );

  if (!tmsApp) {
    res.status(400).json({
      message: `Application ${existingTask.Task_app_Acronym} not found`,
    });
    return;
  }

  console.log(
    `task state change: ${existingTask.Task_state} -> ${newTask.Task_state}`
  );

  //* check state changes

  //- same state transition
  if (existingTask.Task_state == newTask.Task_state) {
    let inGroup = false;
    let errorMessage = "invalid task transition";

    switch (newTask.Task_state) {
      case Task_State.OPEN:
        inGroup =
          tmsApp.App_permit_Open != null
            ? await UserGroupDB.Checkgroup(
                payload.username,
                tmsApp.App_permit_Open
              )
            : inGroup;
        break;
      case Task_State.TODO:
        inGroup = tmsApp.App_permit_toDoList
          ? await UserGroupDB.Checkgroup(
              payload.username,
              tmsApp.App_permit_toDoList
            )
          : inGroup;
        break;
      case Task_State.DOING:
        inGroup = tmsApp.App_permit_Doing
          ? await UserGroupDB.Checkgroup(
              payload.username,
              tmsApp.App_permit_Doing
            )
          : inGroup;
        break;
      case Task_State.DONE:
        inGroup = tmsApp.App_permit_Done
          ? await UserGroupDB.Checkgroup(
              payload.username,
              tmsApp.App_permit_Done
            )
          : inGroup;
        break;
      case Task_State.CLOSE:
        inGroup = false;
        errorMessage = "Closed task cannot be updated";
        break;
      default:
        break;
    }
    if (!inGroup) {
      res.status(400).json({ message: errorMessage });
      return;
    } else {
      next();
      return;
    }
  }

  if (
    existingTask.Task_state == Task_State.OPEN &&
    newTask.Task_state == Task_State.TODO &&
    tmsApp.App_permit_Open != null &&
    (await UserGroupDB.Checkgroup(payload.username, tmsApp.App_permit_Open))
  ) {
    next();
    return;
  }

  if (
    existingTask.Task_state == Task_State.TODO &&
    newTask.Task_state == Task_State.DOING &&
    tmsApp.App_permit_toDoList != null &&
    (await UserGroupDB.Checkgroup(payload.username, tmsApp.App_permit_toDoList))
  ) {
    next();
    return;
  }
  if (
    existingTask.Task_state == Task_State.DOING &&
    newTask.Task_state == Task_State.DONE &&
    tmsApp.App_permit_Doing != null &&
    (await UserGroupDB.Checkgroup(payload.username, tmsApp.App_permit_Doing))
  ) {
    next();
    return;
  }
  if (
    existingTask.Task_state == Task_State.DONE &&
    newTask.Task_state == Task_State.CLOSE &&
    tmsApp.App_permit_Done != null &&
    (await UserGroupDB.Checkgroup(payload.username, tmsApp.App_permit_Done))
  ) {
    next();
    return;
  }

  if (
    existingTask.Task_state == Task_State.DONE &&
    newTask.Task_state == Task_State.DOING &&
    tmsApp.App_permit_Done != null &&
    (await UserGroupDB.Checkgroup(payload.username, tmsApp.App_permit_Done))
  ) {
    next();
    return;
  }
  if (
    existingTask.Task_state == Task_State.DOING &&
    newTask.Task_state == Task_State.TODO &&
    tmsApp.App_permit_Doing != null &&
    (await UserGroupDB.Checkgroup(payload.username, tmsApp.App_permit_Doing))
  ) {
    next();
    return;
  }

  return res.status(400).json({ message: "Invalid task state transition" });
};
