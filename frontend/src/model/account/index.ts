// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export interface Account extends Object {
	username: string;
	password: string;
	email?: string | null;
	accountStatus: string;
}

export interface AccountUpdate {
	username: string;
	password?: string;
	email?: string | null;
	accountStatus?: string;
}
