export interface Task {
  Task_id: string;
  Task_plan: string | null;
  Task_app_Acronym: string;
  Task_name: string;
  Task_description: string;
  Task_notes: string;
  Task_state: string;
  Task_creator: string;
  Task_owner: string;
  Task_createDate: number;
}
