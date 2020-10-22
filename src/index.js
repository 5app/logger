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

const logger = enableJsonLogs ? jsonLogger : simpleLogger;
const noLog = () => {}; // eslint-disable-line no-empty-function

function logWithLevel(level) {
	const shouldLog = levels[level] >= levels[minimumLogLevel];

	return (...parameters) => (shouldLog ? logger(level, ...parameters) : noLog);
}

module.exports = {
	[DEBUG]: logWithLevel(DEBUG),
	[INFO]: logWithLevel(INFO),
	[WARN]: logWithLevel(WARN),
	[ERROR]: logWithLevel(ERROR),
};
