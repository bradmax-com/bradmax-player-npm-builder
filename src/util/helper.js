#! /usr/bin/env node

'use strict';

const _fs = require('fs');
const _cli = require('commander');
const _yarn = require('./../tool/yarn');
const _log = require('./logger');
const _server = require('./server');
const _file = require('./file');
const _path = require('path');

exports.join = _path.join;

const _ROOT = _path.resolve(__dirname, '../..');

function root(...args) {
	args = Array.prototype.slice.call(arguments, 0);
	return _path.join.apply(_path, [_ROOT].concat(args));
}
exports.root = root;
exports.BIN_ROOT = this.root(`node_modules/.bin`);

let startTime = 0;

function stop(PACKAGE) {
	const sec = (new Date().getTime() - startTime.getTime()) / 1000;
	_log.next(`-- ${PACKAGE.name} - ${PACKAGE.version} ----------------------------------------------------------------- `);
	_log.debug(`in ${sec}s.`);
}
exports.stop = stop;

function start(PACKAGE) {
	_log.next(`-- ${PACKAGE.name} - ${PACKAGE.version} ----------------------------------------------------------------- `);
	startTime = new Date();
}
exports.start = start;

async function install(dir, name, version) {
	if (_cli.localServer) {
		_log.task(`uninstall ${name}`);
		try {
			await _yarn.uninstall(dir, name);
		} catch (e) {}
		_log.done();

		_log.task(`yarn cache clean`);
		await _yarn.clean();
		_log.done();

		if (_cli.localServer) {
			await _server.startServer(version);
			_log.task(`install ${name} from local server: ${_server.PLAYER_JS}`);
			try {
				await _yarn.install(dir, _server.PLAYER_JS, `-B`);
			} catch (e) {
				await _server.stopServer();
				throw e;
			}
			_log.done();
			_log.task(`stop server`);
			await _server.stopServer();
			_log.done();
		}
	}
	if (!_cli.debug) {
		_log.task(`install npm dependencies`);
		await _yarn.install(dir);
		_log.done();
	}
}
exports.install = install;

async function end(input, output, PACKAGE) {
	/* PACK */
	await pack(input, output, PACKAGE);
	/* CLEAN output */
	if (!_cli.debug && !_cli.link) {
		_log.task(`remove ${input}`);
		await _file.rmdir(input);
		_log.done();
	}
}
exports.end = end;

async function pack(input, output, PACKAGE) {
	const fileName = PACKAGE.name.split('@').join('').split('/').join('-');
	const filePath = `${output}/${fileName}-v${PACKAGE.version}.tgz`;
	_log.task(`pack module / ${fileName}-v${PACKAGE.version}.tgz`);
	if (await _file.exist(output) == false)
		await _file.mkdir(output);
	if (await _file.exist(filePath))
		await _file.unlink(filePath);
	await _yarn.pack(input, filePath);
	_log.done();
}
