import { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import assert from "node:assert";
import {
  Application,
  ApplicationUpdate,
  Plan,
  Task,
  TaskUpdate,
} from "../../../model";

export const checkApplicationExists = async (
  db: Connection,
  appAcronym: string
): Promise<boolean> => {
  const sql = `
    SELECT EXISTS (
        SELECT App_Acronym
        FROM Application
        WHERE App_Acronym = ?
        ORDER BY App_Acronym
    ) AS exists_result
    `;
  const values = [appAcronym];

  try {
    const [result] = await db.query<RowDataPacket[]>(sql, values);
    const existResult = parseInt(result[0].exists_result);
    return existResult == 1;
  } catch (error) {
    throw error;
  }
};

export const fetchApplication = async (
  db: Connection,
  appAcronym: string
): Promise<Application | null> => {
  const sql = "SELECT * FROM Application WHERE App_Acronym = ? LIMIT 1";
  const values = [appAcronym];
  try {
    const [results] = await db.execute<Application[]>(sql, values);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw error;
  }
};

export const fetchAllApplications = async (
  db: Connection
): Promise<Application[]> => {
  const sql = "SELECT * FROM Application ORDER BY App_Acronym, App_Rnumber";
  try {
    const [results] = await db.query<Application[]>(sql);
    return results;
  } catch (error) {
    throw error;
  }
};

export const fetchApplicationsBygroup = async (
  db: Connection,
  username: string
): Promise<Application[]> => {
  const sql = `
  SELECT DISTINCT A.*
  FROM
    Application A
  JOIN UserGroup U
    ON U.user_group = A.App_permit_Create
      OR U.user_group = A.App_permit_Open
      OR U.user_group = A.App_permit_toDoList
      OR U.user_group = A.App_permit_Doing
      OR U.user_group = A.App_permit_Done
  WHERE U.username = ?;
  `;
  const values = [username];
  try {
    const [result] = await db.query<Application[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};

export const createApplication = async (
  db: Connection,
  app: Application
): Promise<void> => {
  const sql = `
    INSERT INTO Application 
    (
        App_Acronym, 
        App_Description, 
        App_Rnumber, 
        App_startDate, 
        App_endDate, 
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const values = [
    app.App_Acronym,
    app.App_Description ?? null,
    app.App_Rnumber,
    app.App_startDate,
    app.App_endDate,
    app.App_permit_Create ?? null,
    app.App_permit_Open ?? null,
    app.App_permit_toDoList ?? null,
    app.App_permit_Doing ?? null,
    app.App_permit_Done ?? null,
  ];

  try {
    const [inserted] = await db.execute<ResultSetHeader>(sql, values);
    if (inserted.affectedRows > 0) {
      console.log(`created ${app.App_Acronym} app`);
    }
  } catch (error) {
    throw error;
  }
};

export const updateApplication = async (
  db: Connection,
  app: ApplicationUpdate
): Promise<void> => {
  let sql = `UPDATE Application SET `;

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (app.App_Description !== undefined) {
    fields.push("App_Description = ?");
    values.push(app.App_Description);
  }

  if (app.App_Rnumber !== undefined) {
    fields.push("App_Rnumber = ?");
    values.push(app.App_Rnumber);
  }

  if (app.App_permit_Open !== undefined) {
    fields.push("App_permit_Open= ?");
    values.push(app.App_permit_Open);
  }

  if (app.App_permit_Create !== undefined) {
    fields.push("App_permit_Create= ?");
    values.push(app.App_permit_Create);
  }

  if (app.App_permit_toDoList !== undefined) {
    fields.push("App_permit_toDoList= ?");
    values.push(app.App_permit_toDoList);
  }

  if (app.App_permit_Doing !== undefined) {
    fields.push("App_permit_Doing= ?");
    values.push(app.App_permit_Doing);
  }

  if (app.App_permit_Done !== undefined) {
    fields.push("App_permit_Done= ?");
    values.push(app.App_permit_Done);
  }

  assert(values.length == fields.length, "values and fields must be equal");

  if (values.length === 0) return;
  sql += fields.join(", ");
  sql += ` WHERE App_Acronym = ?`;
  values.push(app.App_Acronym);

  try {
    const [inserted] = await db.execute<ResultSetHeader>(sql, values);
    if (inserted.affectedRows > 0) {
      console.log(`updated app: ${app.App_Acronym}`);
    }
  } catch (error) {
    throw error;
  }
};

export const createPlan = async (db: Connection, plan: Plan) => {
  const sql = `
        INSERT INTO Plan
        (
            Plan_MVP_name,
            Plan_app_Acronym,
            Plan_startDate,
            Plan_endDate,
            Plan_color
        )
        VALUES (?, ?, ?, ?, ?)
    `;
  const values = [
    plan.Plan_MVP_name,
    plan.Plan_app_Acronym,
    plan.Plan_startDate,
    plan.Plan_endDate,
    plan.Plan_color ?? null,
  ];
  try {
    const [inserted] = await db.execute<ResultSetHeader>(sql, values);
    if (inserted.affectedRows > 0)
      console.log(`created plan: ${plan.Plan_app_Acronym}`);
  } catch (error) {
    throw error;
  }
};

export const updatePlan = async (db: Connection, plan: Plan) => {
  const sql = `
    UPDATE Plan
    SET
        Plan_app_Acronym = ?, Plan_startDate = ?, Plan_endDate = ?, Plan_color = ?
    WHERE Plan_MVP_name = ?
  `;
  const values = [
    plan.Plan_app_Acronym,
    plan.Plan_startDate,
    plan.Plan_endDate,
    plan.Plan_color ?? null,
    plan.Plan_MVP_name,
  ];
  try {
    const [result] = await db.execute<ResultSetHeader>(sql, values);
    if (result.affectedRows > 0) console.log("successfully updated plan");
  } catch (error) {
    throw error;
  }
};

export const createTask = async (db: Connection, task: Task) => {
  const sql = `
    INSERT INTO Task
    (
        Task_id,
        Task_plan,
        Task_app_Acronym,
        Task_name,
        Task_description,
        Task_notes,
        Task_state,
        Task_creator,
        Task_owner,
        Task_createDate
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    task.Task_id,
    task.Task_plan ?? null,
    task.Task_app_Acronym,
    task.Task_name,
    task.Task_description ?? null,
    task.Task_notes ?? null,
    task.Task_state,
    task.Task_creator,
    task.Task_owner,
    task.Task_createDate,
  ];

  try {
    const [result] = await db.execute<ResultSetHeader>(sql, values);
    if (result.affectedRows > 0) console.log(`created task: ${task.Task_id}`);
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (
  db: Connection,
  task: TaskUpdate
): Promise<void> => {
  let sql = `UPDATE TASK SET `;

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (task.Task_state !== undefined) {
    fields.push("Task_state= ?");
    values.push(task.Task_state);
  }
  if (task.Task_notes !== undefined) {
    fields.push("Task_notes= ?");
    values.push(task.Task_notes);
  }
  if (task.Task_owner !== undefined) {
    fields.push("Task_owner= ?");
    values.push(task.Task_owner);
  }
  if (task.Task_plan !== undefined) {
    fields.push("Task_plan= ?");
    values.push(task.Task_plan);
  }

  if (task.Task_description !== undefined) {
    fields.push("Task_description= ?");
    values.push(task.Task_description);
  }

  assert(
    values.length == fields.length,
    "values and fields must have the same length"
  );

  if (values.length == 0) return;
  sql += fields.join(", ");
  sql += ` WHERE Task_id = ?`;
  values.push(task.Task_id);

  try {
    await db.execute<ResultSetHeader>(sql, values);
  } catch (error) {
    throw error;
  }
};

export const fetchTask = async (
  db: Connection,
  taskId: string
): Promise<Task | null> => {
  const sql = `
  SELECT * 
  FROM Task
  WHERE Task_id = ?
  ORDER BY Task_id
  LIMIT 1
  `;
  const values = [taskId];
  try {
    const [result] = await db.query<Task[]>(sql, values);
    if (result.length > 0) return result[0];
    return null;
  } catch (error) {
    throw error;
  }
};

export const fetchTasksByApp = async (
  db: Connection,
  appAcronym: string
): Promise<Task[]> => {
  const sql = `
    SELECT * 
    FROM Task
    WHERE Task_app_Acronym = ?
    ORDER BY Task_createDate DESC    
    `;
  const values = [appAcronym];
  try {
    const [result] = await db.query<Task[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchTasksByPlan = async (
  db: Connection,
  taskPlan: string
): Promise<Task[]> => {
  const sql = `
    SELECT *
    FROM Task
    WHERE Task_plan = ?
    ORDER BY Task_createDate DESC
    `;
  const values = [taskPlan];
  try {
    const [result] = await db.query<Task[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchPlan = async (
  db: Connection,
  mvpName: string
): Promise<Plan | null> => {
  const sql = `
        SELECT * 
        FROM Plan
        WHERE Plan_MVP_name = ?
        LIMIT 1
    `;
  const values = [mvpName];

  try {
    const [result] = await db.execute<Plan[]>(sql, values);
    if (result.length == 0) return null;
    return result[0];
  } catch (error) {
    throw error;
  }
};

export const fetchPlanByAppAndMVP = async (
  db: Connection,
  appAcronym: string,
  planMVPName: string
): Promise<Plan | null> => {
  const sql = `
  SELECT *
  FROM Plan
  WHERE 
    Plan_app_Acronym = ? AND
    Plan_MVP_name = ?
  ORDER BY
    Plan_app_Acronym,
    Plan_MVP_name
  `;
  const values = [appAcronym, planMVPName];
  try {
    const [plans] = await db.query<Plan[]>(sql, values);
    if (plans.length == 0) return null;
    return plans[0];
  } catch (error) {
    throw error;
  }
};

/**
 * fetch all plans that belongs to app
 * @param db
 * @param appAcronym
 * @returns
 */
export const fetchPlansByApp = async (
  db: Connection,
  appAcronym: string
): Promise<Plan[]> => {
  const sql = `
    SELECT 
        * 
    FROM 
        Plan
    WHERE 
        Plan_app_Acronym = ?
    ORDER BY 
        Plan_startDate ASC,
        Plan_endDate DESC
  `;
  const values = [appAcronym];
  try {
    const [result] = await db.query<Plan[]>(sql, values);
    return result;
  } catch (error) {
    throw error;
  }
};
