import assert from 'node:assert/strict';
import sinon from 'sinon';
import {importFresh} from './utils.js';

describe('JSON logger', () => {
	const write = process.stdout.write;
	const TAG = '12345';
	const now = new Date();
	let clock;
	let logger;
	let output;

	before(async () => {
		process.env.TAG = TAG;
		process.env.LOG_FORMAT = 'json';
		logger = await importFresh('../src/index.js');
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
