export type { Account } from './account';
export type { Application } from './application';
export type { Plan } from './plan';
export type { Task } from './task';
export type { UserGroup } from './user_group';

export interface AccountPayload {
	isAdmin: boolean;
	username: string;
	passwordHash: string;
	ipAddress: string | undefined;
	userAgent: string | undefined;
}
