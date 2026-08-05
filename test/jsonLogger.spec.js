const assert = require('assert');
const sinon = require('sinon');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('JSON logger', () => {
	const write = process.stdout.write;
	const TAG = '12345';
	const now = new Date();
	let clock;
	let output;
	let logger;

	before(() => {
		delete require.cache[require.resolve('../src')];
		process.env.TAG = TAG;
		process.env.LOG_FORMAT = 'json';
		logger = require('../src');
		clock = sinon.useFakeTimers(now.getTime());
	});

	after(() => {
		clock.restore();
	});

	beforeEach(() => {
		output = '';
		process.stdout.write = str => {
			output += str;
		};
	});

	afterEach(() => {
		process.stdout.write = write;
	});

	it('logs 1-line json messages to the standard output', () => {
		const testMessage = 'simple message';

		logger.info(testMessage);

		assert.strictEqual(output.trim(), JSON.stringify({
			level: 'info',
			message: testMessage,
			tag: TAG,
			timestamp: now.toISOString(),
		}));
	});

	it('provides the details of the error and its context', () => {
		const humanReadableErrorMessage = 'Unknown user';
		const originalErrorMessage = 'user not found';
		const error = new Error(originalErrorMessage);
		error.statusCode = 404;
		const context = {id: 1, host: 'example.com'};

		logger.error(humanReadableErrorMessage, context, error);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'error',
			message: humanReadableErrorMessage,
			tag: TAG,
			timestamp: now.toISOString(),
			...context,
			error: originalErrorMessage,
			statusCode: 404,
			stacktrace: sinon.match.array,
		});
	});

	['debug', 'info', 'warn', 'error'].forEach(level => {
		it(`supports slackAlert at the "${level}" level, prepending "slackAlert " to the message and adding a slackAlertId`, () => {
			const testMessage = 'something happened';

			logger.slackAlert(level, testMessage);

			sinon.assert.match(JSON.parse(output.trim()), {
				level,
				message: `slackAlert ${testMessage}`,
				tag: TAG,
				timestamp: now.toISOString(),
				slackAlertId: sinon.match(UUID_REGEX),
			});
		});
	});

	it('merges the slackAlertId into a provided context object', () => {
		const testMessage = 'something happened';
		const context = {id: 1, host: 'example.com'};

		logger.slackAlert('warn', testMessage, context);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'warn',
			message: `slackAlert ${testMessage}`,
			...context,
			slackAlertId: sinon.match(UUID_REGEX),
		});
	});

	it('generates a different slackAlertId for each call', () => {
		logger.slackAlert('info', 'first');
		const {slackAlertId: firstId} = JSON.parse(output.trim());

		output = '';
		logger.slackAlert('info', 'second');
		const {slackAlertId: secondId} = JSON.parse(output.trim());

		assert.notStrictEqual(firstId, secondId);
	});

	it('supports slackAlert at the "error" level with a context and an error object', () => {
		const humanReadableErrorMessage = 'Unknown user';
		const originalErrorMessage = 'user not found';
		const error = new Error(originalErrorMessage);
		error.statusCode = 404;
		const context = {id: 1, host: 'example.com'};

		logger.slackAlert('error', humanReadableErrorMessage, context, error);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'error',
			message: `slackAlert ${humanReadableErrorMessage}`,
			tag: TAG,
			timestamp: now.toISOString(),
			...context,
			error: originalErrorMessage,
			statusCode: 404,
			stacktrace: sinon.match.array,
			slackAlertId: sinon.match(UUID_REGEX),
		});
	});

	it('supports slackAlert at the "error" level using the (message, errorObject) shorthand, without losing the error details', () => {
		const originalErrorMessage = 'user not found';
		const error = new Error(originalErrorMessage);
		error.statusCode = 404;

		logger.slackAlert('error', 'Unknown user', error);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'error',
			message: 'slackAlert Unknown user',
			tag: TAG,
			timestamp: now.toISOString(),
			error: originalErrorMessage,
			statusCode: 404,
			stacktrace: sinon.match.array,
			slackAlertId: sinon.match(UUID_REGEX),
		});
	});

	it('defaults to the "error" level when level is omitted', () => {
		const testMessage = 'something happened';
		const context = {id: 1, host: 'example.com'};

		logger.slackAlert(testMessage, context);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'error',
			message: `slackAlert ${testMessage}`,
			...context,
			slackAlertId: sinon.match(UUID_REGEX),
		});
	});

	it('treats an unrecognised level string as the message, defaulting to "error"', () => {
		const context = {id: 1, host: 'example.com'};

		logger.slackAlert('not-a-real-level', context);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'error',
			message: 'slackAlert not-a-real-level',
			...context,
			slackAlertId: sinon.match(UUID_REGEX),
		});
	});

	it('supports fetching context dynamically', () => {
		const humanReadableErrorMessage = 'Unknown user';
		const originalErrorMessage = 'user not found';
		const error = new Error(originalErrorMessage);
		error.statusCode = 404;
		const context = {id: 1, host: 'example.com'};

		logger.addContext(() => ({
			correlationId: 12345,
		}));

		logger.error(humanReadableErrorMessage, context, error);

		sinon.assert.match(JSON.parse(output.trim()), {
			level: 'error',
			message: humanReadableErrorMessage,
			tag: TAG,
			timestamp: now.toISOString(),
			correlationId: 12345,
			...context,
			error: originalErrorMessage,
			statusCode: 404,
			stacktrace: sinon.match.array,
		});
	});
});
