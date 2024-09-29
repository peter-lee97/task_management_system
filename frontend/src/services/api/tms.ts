import { baseAPI } from '$lib';
import type { Application, ApplicationUpdate, Plan, Task, TaskInsert, TaskUpdate } from '$models';

export const fetchUserApplications = async (): Promise<Application[]> => {
	const response = await baseAPI.get('/tms/fetchUserApplications');
	if (response.status != 200) return [];
	return response.data['result'] ?? [];
};

export const createApplication = async (newApp: Application): Promise<Application | null> => {
	const response = await baseAPI.post('/tms/createApplication', newApp);
	if (response.status == 200) return response.data['result'];
	return null;
};

export const updateApplication = async (
	updateApp: ApplicationUpdate
): Promise<Application | null> => {
	const response = await baseAPI.post('/tms/updateApplication', updateApp);
	if (response.status == 200) return response.data['result'];
	return null;
};

export const fetchPlans = async (appAcronym: string, mvpName?: string): Promise<Plan[]> => {
	const response = await baseAPI.post('/tms/fetchPlans', { appAcronym, mvpName });
	if (response.status == 200) return response.data['result'];
	return [];
};

export const createPlan = async (newPlan: Plan): Promise<Plan | null> => {
	const response = await baseAPI.post('/tms/createPlan', {
		...newPlan,
		appAcronym: newPlan.Plan_app_Acronym
	});
	if (response.status == 200) return response.data['result'] as Plan;
	return null;
};

export const createTask = async (newTask: TaskInsert): Promise<Task | null> => {
	const response = await baseAPI.post('/tms/createTask', {
		...newTask,
		appAcronym: newTask.Task_app_Acronym
	});
	if (response.status == 200) return response.data.result;
	return null;
};

export const updateTask = async (task: TaskUpdate): Promise<Task | null> => {
	const response = await baseAPI.post('/tms/updateTask', {
		...task,
		appAcronym: task.Task_app_Acronym
	});
	if (response.status == 200) return response.data.result;
	return null;
};

export const fetchTasks = async (appAcronym: string): Promise<Task[]> => {
	const response = await baseAPI.post('/tms/fetchTasks', { appAcronym });
	if (response.status == 200) return response.data['result'];
	return [];
};

export const fetchActions = async (appAcronym: string | undefined): Promise<string[]> => {
	const response = await baseAPI.post('/tms/fetchActions', { appAcronym });
	if (response.status == 200) return response.data['result'];
	return [];
};
