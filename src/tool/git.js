#! /usr/bin/env node

'use strict';

const {
	spawn
} = require('child_process');
const _log = require('./../util/logger');

async function version(dir) {
	return new Promise(async (resolve, reject) => {
		const args = ['describe', '--abbrev=0', '--tags'];
		const cmd = `git`;
		const program = spawn(cmd, args, {
			cwd: dir
		});
		let error = null;
		let value = null;

		program.stdout.on('data', data => {
			error = value = data.toString();
		});

		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`GIT:ANT`, error);
		});

		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve(value);
			else reject(`GIT:FAIL ${error}`);
		});
	});
}
exports.version = version;
