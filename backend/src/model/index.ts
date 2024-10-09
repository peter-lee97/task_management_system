import { RowDataPacket } from "mysql2/promise";

declare module "express-serve-static-core" {
  interface Request {
    accountPayload?: AccountPayload;
  }
}

export interface AccountPayload {
  username: string;
  ipAddress: string | undefined;
  userAgent: string | undefined;
}

export interface Account extends RowDataPacket {
  username: string;
  password: string;
  email?: string | null;
  accountStatus: string;
}

export interface UserGroup extends RowDataPacket {
  username: string;
  user_group: string;
}

export interface Application extends RowDataPacket {
  App_Acronym: string;
  App_Description: string | null;
  App_Rnumber: number;
  App_startDate: number;
  App_endDate: number;
  App_permit_Create: string | null;
  App_permit_Open: string | null;
  App_permit_toDoList: string | null;
  App_permit_Doing: string | null;
  App_permit_Done: string | null;
}

export interface ApplicationUpdate {
  App_Acronym: string;
  App_Description?: string | null;
  App_Rnumber?: number | null;
  App_startDate?: number | null;
  App_endDate?: number | null;
  App_permit_Create?: string | null;
  App_permit_Open?: string | null;
  App_permit_toDoList?: string | null;
  App_permit_Doing?: string | null;
  App_permit_Done?: string | null;
}

export interface Plan extends RowDataPacket {
  Plan_MVP_name: string;
  Plan_app_Acronym: string;
  Plan_startDate: number;
  Plan_endDate: number;
  Plan_color: string | null;
}

export interface Task extends RowDataPacket {
  Task_id: string;
  Task_plan: string | null;
  Task_app_Acronym: string;
  Task_name: string;
  Task_description: string | null;
  Task_notes: string | null;
  Task_state: string;
  Task_creator: string;
  Task_owner: string;
  Task_createDate: number;
}

export interface TaskInsert {
  Task_plan: string | null;
  Task_app_Acronym: string;
  Task_name: string;
  Task_description: string | null;
  Task_notes: string | null;
  Task_state: string;
  Task_creator: string;
  Task_owner: string;
  Task_createDate: number;
}

export interface TaskUpdate {
  Task_id: string;
  Task_state: string;
  Task_description?: string | null;
  Task_plan?: string | null;
  Task_notes?: string | null;
  Task_owner?: string;
}

export const isPlanValid = (object: any): string | null => {
  if (typeof object.Plan_MVP_name !== "string") {
    return "Plan_MVP_name must be a type string";
  }

  if (typeof object.Plan_app_Acronym !== "string") {
    return "Plan_app_Acronym must be a type string";
  }

  if (typeof object.Plan_color !== "string") {
    return "Plan_color must a type string";
  }

  if (
    typeof object.Plan_startDate !== "number" ||
    typeof object.Plan_startDate !== "number"
  ) {
    return "Plan_startDate or Plan_endDate must be in type number";
  }

  return null;
};

/**
 * For check when inserting task
 * @param object
 * @returns
 */
export const isTaskValid = (object: any): string | null => {
  if (object.Task_plan != null && typeof object.Task_plan !== "string") {
    return "Task_plan must be a type string or null";
  }

  if (typeof object.Task_app_Acronym !== "string") {
    return "Task_app_Acronym must be a type string";
  }

  if (typeof object.Task_name !== "string") {
    return "Task_name must be a type string";
  }

  if (
    object.Task_description != null &&
    typeof object.Task_description !== "string"
  ) {
    return "Task_description must be a type string or null";
  }

  if (object.Task_notes != null && typeof object.Task_notes !== "string") {
    return "Task_notes must be a type string or null";
  }

  if (typeof object.Task_state !== "string") {
    return "Task_state must be a type string";
  }

  if (!Object.values(Task_State).includes(object.Task_state)) {
    return `Task_state must be only [ ${Object.values(Task_State)} ]`;
  }

  if (typeof object.Task_creator !== "string") {
    return "Task_creator must be a type string";
  }

  if (typeof object.Task_owner !== "string") {
    return "Task_owner must be a type string";
  }

  if (typeof object.Task_createDate !== "number") {
    return "Task_createDate must be a type number";
  }
  return null;
};

export enum Task_State {
  OPEN = "open",
  TODO = "todo",
  DOING = "doing",
  DONE = "done",
  CLOSED = "closed",
}

export enum Permits {
  CREATE_TASK = "createtask",
  CREATE_APP = "createapp",
  CREATE_PLAN = "createplan",
  ADD_NOTES = "addnotes",
  OPEN = "open",
  TODO = "todo",
  DOING = "doing",
  DONE = "done",
  CLOSE = "closed",
}
