import type { Task } from '$models';
import axios, { AxiosError } from 'axios';

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

CreateTask(
	'pl',
	'abc123!!',
	'Youtube',
	'Add to Playlist Feature',
	'Implement new feature to add videos into playlist feature',
	'Starting new task, need to get it out ASAP',
	'sprint 1'
)
	.then((tid) => {
		if (tid == null) return; // do nothing
		console.log(`task created: ${tid}`);
	})
	.catch((e) => {
		let errorMsg = 'Unexpected Error';
		if (e instanceof AxiosError) {
			errorMsg = e.response?.data.msgCode ?? 'failed to create task';
		}
		console.error(errorMsg);
	});

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

GetTaskByState('pl', 'abc123!!', 'open', 'youtube')
	.then((result) => {
		console.log(`open state: ${result.length}`);
	})
	.catch((e) => {
		let errorMsg = 'Unexpected Error';
		if (e instanceof AxiosError) {
			errorMsg = e.response?.data.msgCode ?? 'failed to create task';
		}
		console.error(errorMsg);
	});

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

PromoteTask2Done(
	'pl',
	'abc123!!',
	'YouTube',
	'YouTube_3',
	'I have completed my task, please take a look!'
)
	.then((tid) => {
		if (tid == null) return; // do nothing
		console.log(`task created: ${tid}`);
	})
	.catch((e) => {
		let errorMsg = 'Unexpected Error';
		if (e instanceof AxiosError) {
			errorMsg = e.response?.data.msgCode ?? 'failed to create task';
		}
		console.error(errorMsg);
	});
