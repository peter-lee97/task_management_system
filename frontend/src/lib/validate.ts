export function validatePassword(password: string): string | null {
	if (!password) return 'Password required';

	const containsAlphabet = /[a-zA-Z]/.test(password);
	const containsNumber = /[0-9]/.test(password);
	const containsSpecialChar = /[^a-zA-Z0-9]/.test(password);
	const withinLength = password.length >= 8 && password.length <= 10;

	console.log(
		`alphabet: ${containsAlphabet} | digits: ${containsNumber} | specialChar: ${containsSpecialChar} | length: ${password.length}`
	);
	if (!(containsAlphabet && containsNumber && containsSpecialChar && withinLength)) {
		return 'Password must be a minimum length of 8 characters and a maximum length of 10 characters, and must contain at least 1 letter, 1 number, and 1 special character';
	}
	return null;
}

export function validateGroup(value: string): string | null {
	if (value.length < 1 || value.length > 50) {
		return 'Group input must be between 1 to 50 characters';
	}
	const regex = /^[a-zA-Z0-9_]{1,50}$/;

	if (!regex.test(value)) return 'Group put can only contain alphanumeric and underscore';
	return null;
}

export function validateUsername(value: string): string | null {
	if (value.length < 1 || value.length > 50) {
		return 'Username input must be between 1 to 50 characters';
	}
	const regex = /^[a-zA-Z0-9]{1,50}$/;
	if (!regex.test(value)) return 'Username can only contain alphanumeric';
	return null;
}

export function validateEmail(email: string): string | null {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const validEmail = regex.test(email);
	if (!validEmail) return 'Invalid Email Format';
	return null;
}
