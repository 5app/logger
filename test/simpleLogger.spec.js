import assert from 'node:assert/strict';
import chalk from 'chalk';
import {importFresh} from './utils.js';

describe('Simple logger', () => {
	const write = process.stdout.write;
	let output;
	let logger;

	beforeEach(async () => {
		process.env.LOG_FORMAT = 'text';
		logger = await importFresh('../src/index.js');
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

		assert.strictEqual(output.trim(), `${chalk.green('info:')} ${testMessage}`);
	});
});
