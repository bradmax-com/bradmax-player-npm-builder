#! /usr/bin/env node

'use strict';

const {
	spawn
} = require('child_process');
const _log = require('./../util/logger');

async function build(dir) {
	return new Promise(async (resolve, reject) => {
		const args = ['npm'];
		const program = spawn(`ant`, args, {
			cwd: dir
		});
		let error = null;

		program.stdout.on('data', data => {
			error = data.toString();
			_log.verbose('ANT', data.toString());
		});

		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:ANT`, error);
		});

		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`ANT:FAIL ${error}`);
		});
	});
}
exports.build = build;
