#! /usr/bin/env node

'use strict';
const {
	spawn
} = require('child_process');
const _log = require('./../util/logger');
const _help = require('./../util/helper');

async function run(input, output) {
	return new Promise(async (resolve, reject) => {
		const args = [input, `-o`, output, `-c`, `--comments`, `--source-map`, `filename=${output.split('/').pop()}.map, includeSources`];
		const program = spawn(`${_help.BIN_ROOT}/uglifyjs`, args);
		let error = null;

		program.stdout.on('data', data => {
			error = data.toString();
			_log.verbose(`uglify:`, data.toString())
		});

		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`uglify:`, data.toString())
		});

		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`uglify:FAIL`);
		});
	});
}
exports.run = run;
