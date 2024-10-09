import type { Application } from '$models';

export function toDateString(timestamp: number): string {
	const date = new Date(timestamp);
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();
	return `${year}-${month}-${day}`;
}

export function fromDateString(value: string): number {
	const date = new Date(value);
	return date.valueOf() / 1000;
}

export const addDays = function (date: Date, days: number): Date {
	const newDate = new Date(date.valueOf());
	newDate.setDate(date.getDate() + days);
	return newDate;
};

export const printPermits = (app: Application) => {
	console.log(`~~permits~~
		create: ${app.App_permit_Create} |
		open: ${app.App_permit_Open} |
		todo: ${app.App_permit_toDoList} |
		doing: ${app.App_permit_Doing} |
		done: ${app.App_permit_Done}`);
};

export enum Task_State {
	OPEN = 'open',
	TODO = 'todo',
	DOING = 'doing',
	DONE = 'done',
	CLOSED = 'closed'
}

export enum Permit_Enum {
	CREATE_TASK = 'createtask',
	CREATE_APP = 'createapp',
	CREATE_PLAN = 'createplan',
	ADD_NOTES = 'addnotes',
	OPEN = 'open',
	TODO = 'todo',
	DOING = 'doing',
	DONE = 'done',
	CLOSE = 'closed'
}

export enum Context_Key {
	PLAN = 'writable_plan_key',
	TASK = 'writable_task_key',
	ACTIONS = 'action_key'
}
