const assert = require('assert');
const chalk = require('chalk');

describe('Simple logger', () => {
	const write = process.stdout.write;
	let output;
	let logger;

	before(() => {
		delete require.cache[require.resolve('../src')];
		delete process.env.LOG_FORMAT; // do not specify a log format
		logger = require('../src');
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

	it('logs messages to the standard output', () => {
		const testMessage = 'simple message';

		logger.info(testMessage);

		assert.equal(output.trim(), `${chalk.green('info:')} ${testMessage}`);
	});
});
