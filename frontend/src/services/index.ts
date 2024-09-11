import { jwtDecode } from 'jwt-decode';

export const getTokenPayload = (token: string) => {
	return jwtDecode(token);
};
