const {ERROR} = require('./constants');

const {TAG} = process.env;

function formatError(data) {
	if (data instanceof Error) {
		return {
			error: data.message,
			stacktrace: data.stack ? data.stack.split('\n').slice(1, 3).map(line => line.trim()) : undefined,
			statusCode: data.statusCode
		};
	}

	return data;
}

function log(level, message, context = {}, errorObject) {
	let contextObject = context;

	if (level === ERROR) {
		contextObject = {
			...formatError(context),
			...formatError(errorObject),
		};
	}

	const payload = JSON.stringify({
		level,
		message,
		tag: TAG,
		timestamp: new Date().toISOString(),
		...contextObject
	});

	console.log(payload); // eslint-disable-line no-console
}

module.exports = log;
