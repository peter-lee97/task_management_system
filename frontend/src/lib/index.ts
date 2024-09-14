import { PUBLIC_END_POINT, PUBLIC_PORT } from '$env/static/public';
import axios from 'axios';

// place files you want to import through the `$lib` alias in this folder.
export const apiUrl = `http://${PUBLIC_END_POINT}:${PUBLIC_PORT}/api/v1`;

export const baseAPI = axios.create({
	withCredentials: true,
	baseURL: apiUrl,
	headers: { 'Access-Control-Allow-Origin': '*' }
});

export const allStatus = ['active', 'disabled'];

export const unexpectedError = 'An error occured, please contact your admin';
