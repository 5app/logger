import {ERROR} from './constants.js';

const {TAG} = process.env;

function formatError(data) {
	if (data instanceof Error) {
		return {
			error: data.message,
			stacktrace: data.stack ? data.stack.split('\n').map(line => line.trim()) : undefined,
			statusCode: data.statusCode
		};
	}

	return data;
}

export default function log(level, message, context = {}, errorObject, fetchContext) {
	let contextObject = context;

	if (level === ERROR) {
		contextObject = {
			...formatError(context),
			...formatError(errorObject),
		};
	}

	const dynamicContext = typeof fetchContext === 'function' ? fetchContext() : undefined;

	const payload = JSON.stringify({
		level,
		message,
		tag: TAG,
		timestamp: new Date().toISOString(),
		...dynamicContext,
		...contextObject,
	});

	console.log(payload); // eslint-disable-line no-console
}
