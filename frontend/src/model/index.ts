export interface AccountPayload {
	isAdmin: boolean;
	username: string;
	passwordHash: string;
	ipAddress: string | undefined;
	userAgent: string | undefined;
}
export interface Account {
	username: string;
	password: string;
	email?: string | null;
	accountStatus: string;
}
export interface UpdateAccount {
	username: string;
	password?: string;
	email?: string | null;
	accountStatus?: string;
}

export interface UserGroup {
	username: string;
	user_group: string;
}

export interface Application {
	App_Acronym: string;
	App_Description: string | null;
	App_Rnumber: number;
	App_startDate: number;
	App_endDate: number;
	App_permit_create: string;
	App_permit_Open: string;
	App_permit_toDoList: string;
	App_permit_Doing: string;
	App_permit_Done: string;
}

export interface UpdateApplication {
	App_Acronym: string;
	App_Description: string | null;
	App_Rnumber: number;
	App_startDate: number | null;
	App_endDate: number | null;
	App_permit_create: string | null;
	App_permit_Open: string | null;
	App_permit_toDoList: string | null;
	App_permit_Doing: string | null;
	App_permit_Done: string | null;
}

export interface Plan {
	Plan_MVP_name: string;
	Plan_app_Acronym: string;
	Plan_startDate: number;
	Plan_endDate: number;
	Plan_color: string | null;
}

export interface Task {
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
