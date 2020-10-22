const util = require('util');
const chalk = require('chalk');
const {DEBUG, INFO, WARN, ERROR} = require('./constants');

const formatting = {
	[ERROR]: {
		color: chalk.red,
	},
	[WARN]: {
		color: chalk.yellow,
	},
	[INFO]: {
		color: chalk.green,
	},
	[DEBUG]: {
		color: chalk.grey,
		colorAll: true,
	},
};

function log(level, message, context = '') {
	const {color, colorAll} = formatting[level];

	if (colorAll) {
		console.log(color(util.format(`${level}: ${message}`, context))); // eslint-disable-line no-console
	}
	else {
		console.log(`${color(`${level}:`)} ${message}`, context); // eslint-disable-line no-console
	}
}

module.exports = log;
