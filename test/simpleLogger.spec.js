const assert = require('assert');
const chalk = require('chalk');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLACK_ALERT_ID_CAPTURE_REGEX = / \{ slackAlertId: '([0-9a-f-]+)' \}$/i;

const slackAlertExpectations = {
	debug: message => chalk.grey(`debug: ${message}`),
	info: message => `${chalk.green('info:')} ${message}`,
	warn: message => `${chalk.yellow('warn:')} ${message}`,
	error: message => `${chalk.red('error:')} ${message}`,
};

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

		assert.strictEqual(output.trim(), `${chalk.green('info:')} ${testMessage}`);
	});

	Object.entries(slackAlertExpectations).forEach(([level, expected]) => {
		it(`supports slackAlert at the "${level}" level, prepending "slackAlert " to the message and adding a slackAlertId`, () => {
			const testMessage = 'something happened';

			logger.slackAlert(level, testMessage);

			const trimmedOutput = output.trim();
			const [, slackAlertId] = trimmedOutput.match(SLACK_ALERT_ID_CAPTURE_REGEX) || [];

			assert.match(slackAlertId, UUID_REGEX);
			assert.strictEqual(
				trimmedOutput.replace(SLACK_ALERT_ID_CAPTURE_REGEX, ''),
				expected(`slackAlert ${testMessage}`)
			);
		});
	});
});
