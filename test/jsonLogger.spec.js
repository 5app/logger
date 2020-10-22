const assert = require('assert');
const sinon = require('sinon');

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

	it('should log 1-line json messages to the standard output', () => {
		const testMessage = 'simple message';

		logger.info(testMessage);

		assert.equal(output.trim(), JSON.stringify({
			level: 'info',
			message: testMessage,
			tag: TAG,
			timestamp: now.toISOString(),
		}));
	});
});
