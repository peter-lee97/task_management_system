import type { Account } from '../model';

export function validatePassword(password: string): string | null {
	if (!password) return 'Password required';

	const containsAlphabet = /[a-zA-Z]/.test(password);
	const containsNumber = /[0-9]/.test(password);
	const containsSpecialChar = /[^a-zA-Z0-9]/.test(password);

	console.log(
		`alphabet: ${containsAlphabet} | digits: ${containsNumber} | specialChar: ${containsSpecialChar}`
	);
	if (
		!(
			containsAlphabet &&
			containsNumber &&
			containsSpecialChar &&
			password.length >= 8 &&
			password.length <= 10
		)
	) {
		return 'Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least 1 letter, 1 number, and 1 special character';
	}
	return null;
}

export function validateEmail(email: string) {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const validEmail = regex.test(email);
	if (!validEmail) return 'Invalid Email Format';
	return null;
}

export function compareAccount(object1: Account, object2: Account) {
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	if (object1.username !== object2.username) return false;
	if (object1.accountStatus !== object2.accountStatus) return false;
	if (object1.password !== object2.password) return false;
	if (object1.email !== object2.email) return false;

	return true;
}
