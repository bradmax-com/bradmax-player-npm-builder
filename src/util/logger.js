#! /usr/bin/env node

'use strict';

const _cli = require('commander');
const _chlk = require('chalk');
let startTime = 0;
let startTxt = '';
const progressSigns = [`-`, `/`, `|`, `\\`];
let progressSignIdx = 0;
let progressInterval = 0;

/* task */
function task(txt, withProgress = true) {
	if (!_cli.silent) {
		startTxt = txt;
		startTime = new Date();
		this.log(_chlk.green(` - `) + _chlk.white(`${startTxt}`), false);
		progressSignIdx = 0;
		if (!_cli.verbose && withProgress)
			progressInterval = setInterval(function () {
				progressSignIdx++;
				if (progressSignIdx > progressSigns.length - 1)
					progressSignIdx = 0;
				log(_chlk.magenta(`${progressSigns[progressSignIdx]} `) + _chlk.white(`${startTxt}`), false, true);
			}, 100);
	}
}
exports.task = task;

function done(text = null) {
	if (!_cli.silent) {
		clearImmediate(progressInterval);
		const s =( (new Date().getTime() - startTime.getTime()) / 1000).toFixed(3);
		text = text == null ? `` : text;
		this.log(_chlk.green(`√ `) + _chlk.gray(`: ${s} s\t@ `) + _chlk.white(`${startTxt}`) + _chlk.magenta(` ${text}`), true, true);
	}
}
exports.done = done;

/* next */
function next(txt) {
	this.log(_chlk.yellow(`--`) + _chlk.yellow(`${txt}`));
}
exports.next = next;

/* error */
function error(txt) {
	clearImmediate(progressInterval);
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	this.log(_chlk.red(`X `) + _chlk.white(`${startTxt}: `) + _chlk.red(`${txt}`));
}
exports.error = error;


/* verbose */
function verbose(from, txt) {
	this.log(_chlk.gray(from) + ` ` + txt);
}
exports.verbose = verbose;


/* debug */
function debug(txt) {
	this.log(_chlk.gray(`     └─ ${txt}`));
}
exports.debug = debug;

/* log */
function log(msg, NEW_LINE = true, CLEAR_LINE = true) {
	if (!_cli.silent) {
		if (CLEAR_LINE) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
		}
		if (NEW_LINE)
			process.stdout.write(`${msg}\n`);
		else
			process.stdout.write(msg);
	}
}
exports.log = log;
