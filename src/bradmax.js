#! /usr/bin/env node

'use strict';

const _cli = require('commander');
const _semver = require('semver')
const _log = require('./util/logger');
const _help = require('./util/helper');
const _file = require('./util/file');
const _server = require('./util/server');
const _run = require('./util/runner');
//
const SETUP = require('./../setup.json');
const PACKAGE_PATH = _help.root('package.json');
const PACKAGE_PLAYER_JS_PATH = _help.root(`${SETUP['bradmax-player-js']}/package.json`);
const PACKAGE_PLAYER_AG_PATH = _help.root(`${SETUP['bradmax-player-ag']}/package.json`);
const PACKAGE_PLAYER_NG_PATH = _help.root(`${SETUP['bradmax-player-ng']}/package.json`);
const PACKAGE_PLAYER_RX_PATH = _help.root(`${SETUP['bradmax-player-rxjs']}/package.json`);
//
const _playerJs = require('./package/player');
const _playerAg = require('./package/player-ag');
const _playerNg = require('./package/player-ng');
const _playerRx = require('./package/player-rx');
//
const PACKAGE = require(PACKAGE_PATH);
const PACKAGE_PLAYER_JS = require(PACKAGE_PLAYER_JS_PATH);
const PACKAGE_PLAYER_AG = require(PACKAGE_PLAYER_AG_PATH);
const PACKAGE_PLAYER_NG = require(PACKAGE_PLAYER_NG_PATH);
const PACKAGE_PLAYER_RX = require(PACKAGE_PLAYER_RX_PATH);
//
const PLAYER_NAMES = ["gorilla", "mole", "snake", "zebra"];
const TGZ_DIR = _help.root(`dist`);

///// CLI
/// global options
_cli.version(PACKAGE.version)
	// program type
	.option('-i, --install', 'install library in your npm project.')
	// program specific args
	.option('-p, --compilePlayer', 'compile player js sources in local repo before package compilation. Works only with: `player:js`')
	.option('-s, --localServer', 'install bradmax-player-** dependencies before compilation from local distribution server. Works only with: `player:(ag/ng/rx)`')
	// options
	.option('-s, --silent', 'suppress log messages.')
	.option('-d, --debug', 'run debug compilation.');
/// commands
_cli.command('bump:major').description(`bump packages major version.`).action(() => playerBump('major'));
_cli.command('bump:minor').description(`bump packages minor version.`).action(() => playerBump('minor'));
_cli.command('bump:patch').description(`bump packages patch version.`).action(() => playerBump('patch'));
_cli.command('player:js').description(`build ${PACKAGE_PLAYER_JS.name} package.`).action(playerJs);
_cli.command('player:ag').description(`build ${PACKAGE_PLAYER_AG.name} package.`).action(playerAg);
_cli.command('player:ng').description(`build ${PACKAGE_PLAYER_NG.name} package.`).action(playerNg);
_cli.command('player:rx').description(`build ${PACKAGE_PLAYER_RX.name} package.`).action(playerRx);
_cli.command('clear').description(`remove node_modules and dist folders.`).action(clear);
_cli.command('player:server').description(`starts mock distribution server for packages @ ${_server.DIST_HOST}.`).action(() => _server.startServer(PACKAGE.version));
_cli.command('player:server:stop').description(`stops mock distribution server for packages @ ${_server.DIST_HOST}.`).action(_server.stopServer);
/// parse commands
_cli.parse(process.argv);

///// PROGRAMS

/// player js
async function playerBump(release) {
	_log.log('START');

	try {
		_help.start(PACKAGE);
		_log.task(`bump ${release}`);
		const valid = _semver.valid(PACKAGE.version);
		if (valid == null)
			throw `${PACKAGE.version} is invalid semver !`;

		PACKAGE.version =
			PACKAGE_PLAYER_JS.version =
			PACKAGE_PLAYER_AG.version =
			PACKAGE_PLAYER_NG.version =
			PACKAGE_PLAYER_RX.version =
			_semver.inc(PACKAGE.version, release);

		_log.verbose(PACKAGE.version, PACKAGE.name);
		_log.verbose(PACKAGE_PLAYER_JS.version, PACKAGE_PLAYER_JS.name);
		_log.verbose(PACKAGE_PLAYER_AG.version, PACKAGE_PLAYER_AG.name);
		_log.verbose(PACKAGE_PLAYER_NG.version, PACKAGE_PLAYER_NG.name);
		_log.verbose(PACKAGE_PLAYER_RX.version, PACKAGE_PLAYER_RX.name);
		_log.done();

		_log.task(`write packages`);
		let tasks = [];
		tasks.push(_file.write(PACKAGE_PATH, JSON.stringify(PACKAGE, null, '\t')));
		tasks.push(_file.write(PACKAGE_PLAYER_JS_PATH, JSON.stringify(PACKAGE_PLAYER_JS, null, '\t')));
		tasks.push(_file.write(PACKAGE_PLAYER_AG_PATH, JSON.stringify(PACKAGE_PLAYER_AG, null, '\t')));
		tasks.push(_file.write(PACKAGE_PLAYER_NG_PATH, JSON.stringify(PACKAGE_PLAYER_NG, null, '\t')));
		tasks.push(_file.write(PACKAGE_PLAYER_RX_PATH, JSON.stringify(PACKAGE_PLAYER_RX, null, '\t')));
		await _run.parallel(tasks);
		_log.done();

	} catch (e) {
		_log.error(e);
		_help.stop(PACKAGE);
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	} finally {
		_help.stop(PACKAGE);
		_log.log('EXIT');
		process.exit(0);
	}

}

/// player js
async function playerJs() {
	_log.log('START');
	_help.start(PACKAGE_PLAYER_JS);
	try {
		await _playerJs.build(PACKAGE_PLAYER_JS, PLAYER_NAMES, TGZ_DIR);
	} catch (e) {
		_log.error(e);
		_help.stop(PACKAGE_PLAYER_JS);
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	} finally {
		_help.stop(PACKAGE_PLAYER_JS);
		_log.log('EXIT');
		process.exit(0);
	}

}

/// player ag
async function playerAg() {
	_log.log('START');
	_help.start(PACKAGE_PLAYER_AG);
	try {
		await _playerAg.build(PACKAGE_PLAYER_AG, PLAYER_NAMES, TGZ_DIR);
	} catch (e) {
		_log.error(e);
		_help.stop(PACKAGE_PLAYER_AG);
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	} finally {
		_help.stop(PACKAGE_PLAYER_AG);
		_log.log('EXIT');
		process.exit(0);
	}
}

/// player ng
async function playerNg() {
	_log.log('START');
	_help.start(PACKAGE_PLAYER_NG);
	try {
		await _playerNg.build(PACKAGE_PLAYER_NG, PLAYER_NAMES, TGZ_DIR);
	} catch (e) {
		_log.error(e);
		_help.stop(PACKAGE_PLAYER_NG);
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	} finally {
		_help.stop(PACKAGE_PLAYER_NG);
		_log.log('EXIT');
		process.exit(0);
	}
}

/// player rx
async function playerRx() {
	_log.log('START');
	_help.start(PACKAGE_PLAYER_RX);
	try {
		await _playerRx.build(PACKAGE_PLAYER_RX, PLAYER_NAMES, TGZ_DIR);
	} catch (e) {
		_log.error(e);
		_help.stop(PACKAGE_PLAYER_RX);
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	} finally {
		_help.stop(PACKAGE_PLAYER_RX);
		_log.log('EXIT');
		process.exit(0);
	}
}

/// clear
async function clear() {
	_log.log('START');
	try {
		_log.task(`remove packages node_modules`);
		await _file.rimraf(_help.root(`**/node_modules/`));
		_log.done();
		_log.task(`remove packages dist`);
		await _file.rimraf(_help.root(`**/dist/`));
		_log.done();
		_log.task(`remove yarn-error.log`);
		await _file.rimraf(_help.root(`**/yarn-error.log`));
		_log.done();
		if (_cli.debug) {
			_log.task(`remove yarn.lock`);
			await _file.rimraf(_help.root(`**/yarn.lock`));
			_log.done();
		}
	} catch (e) {
		_log.error(e);
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	} finally {
		_log.log('EXIT');
		process.exit(0);
	}

}
