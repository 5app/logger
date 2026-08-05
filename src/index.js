const {randomUUID} = require('node:crypto');
const {DEBUG, INFO, WARN, ERROR} = require('./constants');
const jsonLogger = require('./jsonLogger');
const simpleLogger = require('./simpleLogger');

const {LOG_FORMAT, LOGS_FORMAT, LOG_LEVEL, LOGS_LEVEL} = process.env;
const enableJsonLogs = [LOGS_FORMAT, LOG_FORMAT].includes('json');
const minimumLogLevel = LOG_LEVEL || LOGS_LEVEL || DEBUG;

const levels = {
	[ERROR]: 4,
	[WARN]: 3,
	[INFO]: 2,
	[DEBUG]: 1,
};

let fetchContext;
function addContext(contextFetchingFunction) {
	fetchContext = contextFetchingFunction;
}

const logger = enableJsonLogs ? jsonLogger : simpleLogger;
const noLog = () => {}; // eslint-disable-line no-empty-function

function logWithLevel(level) {
	const shouldLog = levels[level] >= levels[minimumLogLevel];

	return (...parameters) => (shouldLog ? logger(level, ...parameters, fetchContext) : noLog);
}

const logFunctions = {
	[DEBUG]: logWithLevel(DEBUG),
	[INFO]: logWithLevel(INFO),
	[WARN]: logWithLevel(WARN),
	[ERROR]: logWithLevel(ERROR),
};

function slackAlert(levelOrMessage, ...rest) {
	// `level` is optional and defaults to "error". If the first argument isn't a known level,
	// treat it as `message` instead (so an unrecognised level string is silently read as the
	// message rather than throwing).
	const hasLevel = Boolean(logFunctions[levelOrMessage]);
	const level = hasLevel ? levelOrMessage : ERROR;
	const [message, context, ...restParameters] = hasLevel ? rest : [levelOrMessage, ...rest];

	// An Error passed as `context` (the `logger.error(message, errorObject)` shorthand) must stay
	// an Error so the underlying logger can still extract its message/stack/statusCode.
	const isContextAnError = context instanceof Error;
	const contextWithSlackAlertId = {
		...(isContextAnError ? undefined : context),
		slackAlertId: randomUUID(),
	};
	const parameters = isContextAnError ? [context, ...restParameters] : restParameters;

	return logFunctions[level](`slackAlert ${message}`, contextWithSlackAlertId, ...parameters);
}

module.exports = {
	...logFunctions,
	slackAlert,
	addContext,
};
