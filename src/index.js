import {DEBUG, INFO, WARN, ERROR} from './constants.js';
import jsonLogger from './jsonLogger.js';
import simpleLogger from './simpleLogger.js';

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
const noLog = () => {}; // eslint-disable-line

function logWithLevel(level) {
	const shouldLog = levels[level] >= levels[minimumLogLevel];

	return (...parameters) =>
		shouldLog ? logger(level, ...parameters, fetchContext) : noLog;
}

export default {
	[DEBUG]: logWithLevel(DEBUG),
	[INFO]: logWithLevel(INFO),
	[WARN]: logWithLevel(WARN),
	[ERROR]: logWithLevel(ERROR),
	addContext,
};
