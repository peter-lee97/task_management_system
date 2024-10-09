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

/**
 * Call to check if application is in the correct format to submit
 */
export const validateApplication = (inputs: {
	appAcronym: string | undefined;
	rNumber: number | undefined;
	startDate: string;
	endDate: string;
}): string | null => {
	if (!inputs.startDate || !inputs.endDate) {
		return 'Start/End Date must be defined';
	}
	if (!inputs.appAcronym) {
		return 'App_Acronym is required';
	}

	if (!/^[a-zA-Z0-9_]{1,50}$/.test(inputs.appAcronym)) {
		return 'App_Acronym can only contain 50 characters, alphanumeric or _';
	}

	if (!inputs.rNumber) return 'App_Rnumber is required';

	if (!/^[1-9]\d*$/.test(inputs.rNumber.toString())) {
		return 'App_Rnumber must be a positive integer';
	}

	if (inputs.rNumber > 2 ** 8) return `App_Rnumber cannot be greater than ${2 ** 8}`;

	if (inputs.appAcronym.length == 0 || inputs.appAcronym.length > 50) {
		return 'App_Acronym must be within 1 and 50 characters';
	}

	if (!inputs.rNumber || inputs.rNumber < 0) {
		return 'App_Rnumber must be greater than 1';
	}

	return null;
};

export const validatePlanName = (name: string): string | null => {
	if (!name) return 'Plan name cannot be empty';
	// const regex = /^[a-zA-Z0-9_]{1,255}$/;
	if (name.length > 0 && name.length < 255) return null;
	return 'Plan name must be within 1 to 255 characters';
};

export const validateTaskName = (name: string): string | null => {
	if (!name) return 'Task name cannot be empty';
	// const regex = /^[a-zA-Z0-9_]{1,255}$/;
	if (name.length > 0 && name.length < 255) return null;
	return 'Task name must be within 1 to 255 characters';
};

export const validateColor = (colorString: string): string | null => {
	if (!colorString) return 'color is not selected';
	const regex = /^#[A-Fa-f0-9]{6}$/;
	if (!regex.test(colorString)) return 'invalid color format';
	return null;
};
