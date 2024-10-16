import { env } from '$env/dynamic/public';
import axios from 'axios';

// place files you want to import through the `$lib` alias in this folder.
export const apiUrl = `http://${env.PUBLIC_API_END_POINT}:${env.PUBLIC_API_PORT}/api/v1`;
console.log(`api url: ${apiUrl}`);
export const baseAPI = axios.create({
	withCredentials: true,
	baseURL: apiUrl,
	headers: { 'Access-Control-Allow-Origin': '*' }
});
export const allStatus = ['active', 'disabled'];
export const unexpectedErrorMsg = 'An error occured, please contact your admin';
