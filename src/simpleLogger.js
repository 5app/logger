import util from 'node:util';
import chalk from 'chalk';
import {DEBUG, INFO, WARN, ERROR} from './constants.js';

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

export default function log(level, message, context = '', errorObject) {
	const {color, colorAll} = formatting[level];
	const contextObjects = [context, errorObject].filter(Boolean); // Ignore undefined context objects

	if (colorAll) {
		// eslint-disable-next-line no-console
		console.log(
			color(util.format(`${level}: ${message}`, ...contextObjects))
		);
	} else {
		console.log(`${color(`${level}:`)} ${message}`, ...contextObjects); // eslint-disable-line no-console
	}
}
