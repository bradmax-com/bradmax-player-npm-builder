#! /usr/bin/env node

'use strict';

/* IMPORT */
const _fs = require('fs');
const _cli = require('commander');
const _log = require('./../util/logger');
const _help = require('./../util/helper');
const _file = require('./../util/file');
const _run = require('./../util/runner');
const _yarn = require('./../tool/yarn');
const _gulp = require('./../tool/gulp');
const _rollup = require('./../tool/rollup');
const _uglify = require('./../tool/uglify');

/* VARIABLE */
const SETUP = require('./../../setup.json');
const ROOT_DIR = _help.root(SETUP['bradmax-player-ag']);
const OUT = `${ROOT_DIR}/dist`;
const TMP_OUT = `${OUT}/tmp`;

/* EXPORT */
exports.build = build;
async function build(PACKAGE, PLAYER_NAMES, TGZ_DIR) {
	/* INSTALL */
	await _help.install(ROOT_DIR, `@bradmax/player`, PACKAGE.version);

	/* CREATE output */
	_log.task(`output directories`);
	await _file.mkdir(OUT);
	await _file.mkdir(TMP_OUT);
	await _file.mkdir(`${TMP_OUT}/services`);
	await _file.mkdir(`${TMP_OUT}/directives`);
	for (const name of PLAYER_NAMES)
		await _file.mkdir(`${OUT}/${name}`);
	_log.done();

	/* UMD uglify */
	_log.task(`UMD uglify`);
	let uglifyTasks = [
		_uglify.run(`${ROOT_DIR}/src/common.module.js`, `${TMP_OUT}/common.module.min.js`),
		_uglify.run(`${ROOT_DIR}/src/services/bradmax.service.js`, `${TMP_OUT}/services/bradmax.service.min.js`),
		_uglify.run(`${ROOT_DIR}/src/services/create.service.js`, `${TMP_OUT}/services/create.service.min.js`),
		_uglify.run(`${ROOT_DIR}/src/services/parser.service.js`, `${TMP_OUT}/services/parser.service.min.js`)
	];
	for (const name of PLAYER_NAMES) {
		uglifyTasks.push(_uglify.run(`${ROOT_DIR}/src/${name}.module.js`, `${TMP_OUT}/${name}.module.min.js`));
		uglifyTasks.push(_uglify.run(`${ROOT_DIR}/src/directives/${name}.directive.js`, `${TMP_OUT}/directives/${name}.directive.min.js`));
	}
	await _run.parallel(uglifyTasks);
	_log.done();

	/* Gulp */
	_log.task(`gulp building packages`);
	let gulpTasks = [];
	for (const name of PLAYER_NAMES) {
		const gulpTask = _gulp.task(`[${name}] gulp`, [
			// player
			`${ROOT_DIR}/node_modules/@bradmax/player/bundles/version/index.umd.min.js`,
			`${ROOT_DIR}/node_modules/@bradmax/player/${name}/index.js`,
			// Make sure module files are handled first
			`${TMP_OUT}/common.module.min.js`,
			`${TMP_OUT}/${name}.module.min.js`,
			// Then add all JavaScript files
			`${TMP_OUT}/directives/${name}.directive.min.js`,
			`${TMP_OUT}/services/bradmax.service.min.js`,
			`${TMP_OUT}/services/create.service.min.js`,
			`${TMP_OUT}/services/parser.service.min.js`
		], _help.join(OUT, name));
		gulpTasks.push(gulpTask);
	}
	await _run.parallel(gulpTasks);
	_log.done();

	/* package.json */
	_log.task(`prepare package.json`);
	await _file.copy([`${ROOT_DIR}/package.json`], OUT);
	for (const name of PLAYER_NAMES)
		await _file.write(`${OUT}/${name}/package.json`, JSON.stringify({
			name: `${PACKAGE.name}/${name}`,
			version: PACKAGE.version,
			main: `./index.min.js`,
		}, null, '\t'));
	_log.done();

	/* COPY assets */
	_log.task(`copy assets`);
	await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`, `${ROOT_DIR}/index.js`], `${OUT}`);
	for (const name of PLAYER_NAMES)
		await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], `${OUT}/${name}`);
	_log.done();

	/* CLEAN up */
	_log.task(`cleanup`);
	await _file.rimraf(TMP_OUT);
	_log.done();

	/* end */
	await _help.end(OUT, TGZ_DIR, PACKAGE);
}
