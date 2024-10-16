import type { Task } from '$models';
import axios from 'axios';

export const CreateTask = async (
	username: string,
	password: string,
	appAcronym: string,
	taskName: string,
	description: string | undefined,
	taskNotes: string | undefined,
	taskPlan: string | undefined
): Promise<string | null> => {
	try {
		const response = await axios.post(
			'localhost:3000/api/demo/CreateTask',
			{
				username,
				password,
				appAcronym,
				taskName,
				description,
				taskNotes,
				taskPlan
			},
			{ headers: { 'Content-Type': 'application/json' } }
		);
		console.log(response.data.msgCode);
		if (200 != response.status) return null;
		return response.data['result']['Task_id'];
	} catch (error) {
		console.error(error);
	}
	return null;
};

export const GetTaskByState = async (
	username: string,
	password: string,
	appAcronym: string,
	taskState: string
): Promise<Task[]> => {
	try {
		const response = await axios.post(
			'localhost:3000/api/demo/GetTaskByState',
			{
				username,
				password,
				appAcronym,
				taskState
			},
			{ headers: { 'Content-Type': 'application/json' } }
		);
		if (200 != response.status) return [];
		return response.data['result'] as Task[];
	} catch (error) {
		console.error(error);
	}
	return [];
};

export const PromoteTask2Done = async (
	username: string,
	password: string,
	appAcronym: string,
	taskId: string,
	taskNotes: string | undefined
): Promise<string | null> => {
	try {
		const response = await axios.post(
			'localhost:3000/api/demo/PromoteTask2Done',
			{
				username,
				password,
				appAcronym,
				taskId,
				taskNotes
			},
			{ headers: { 'Content-Type': 'application/json' } }
		);
		if (200 != response.status) return null;
		return response.data['result']['Task_id'];
	} catch (error) {
		console.error(error);
	}
	return null;
};
