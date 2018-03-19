#! /usr/bin/env node

'use strict';

const {
	spawn
} = require('child_process');
const _log = require('./../util/logger');

async function aot(dir, configPath, flags = null) {
	return new Promise((resolve, reject) => {
		let args = [`-p`, configPath];
		if (flags)
			args = args.concat(flags.split(' '));
		const cmd = `${dir}/node_modules/.bin/ngc`;
		const program = spawn(cmd, args);
		let error = null;
		program.stdout.on('data', data => {
			error = data.toString();
			_log.verbose(`NGC`, data.toString());
		});
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:NGC`, error);
		});
		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`NGC:FAIL ${error}`);
		});
	});

}
exports.aot = aot;
