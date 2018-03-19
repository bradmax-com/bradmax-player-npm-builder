#! /usr/bin/env node

'use strict';

/* IMPORT */
const _fs = require('fs');
const _cli = require('commander');
const _log = require('./../util/logger');
const _help = require('./../util/helper');
const _file = require('./../util/file');
const _server = require('./../util/server');
const _run = require('./../util/runner');
const _yarn = require('./../tool/yarn');
const _tslint = require('./../tool/tslint');
const _ngc = require('./../tool/ngc');
const _rollup = require('./../tool/rollup');
const _uglify = require('./../tool/uglify');

/* VARIABLE */
const SETUP = require('./../../setup.json');
const ROOT_DIR = _help.root(SETUP['bradmax-player-ng']);
const OUT = `${ROOT_DIR}/dist`;
const TMP_OUT = `${OUT}/tmp`;

/* EXPORT */
exports.build = build;
async function build(PACKAGE, PLAYER_NAMES, TGZ_DIR) {
	/* INSTALL */
	await _help.install(ROOT_DIR, `@bradmax/player`, PACKAGE.version);
	/* LINT */
	_log.task(`tslint`);
	const tslintResults = await _tslint.run(ROOT_DIR, `${ROOT_DIR}/tsconfig.json`, `${ROOT_DIR}/tslint.json`, {
		fix: false,
		formatter: 'stylish'
	});
	_log.done(`errorCount: ${tslintResults.errorCount} warningCount: ${tslintResults.warningCount}`);
	/* CREATE output */
	_log.task(`output directories`);
	await _file.mkdir(OUT);
	_log.done();

	const rollup_banner = `/* ${PACKAGE.name} v${PACKAGE.version} */`;
	const rollup_globals = {
		'tslib': 'tslib',
		'@angular/core': 'ng.core',
		'@angular/common': 'ng.common',
		'rxjs/Observable': 'Rx',
		'rxjs/Observer': 'Rx',
		'@bradmax/player/gorilla': 'bradmax',
		'@bradmax/player/mole': 'bradmax',
		'@bradmax/player/snake': 'bradmax',
		'@bradmax/player/zebra': 'bradmax',
		'@bradmax/player/version': 'bradmax.player.version'
	};

	/* FESM2015 AoT ngc */
	_log.task(`FESM2015 AoT ngc`);
	let es2015AotTasks = [];
	for (const name of PLAYER_NAMES)
		es2015AotTasks.push(_ngc.aot(ROOT_DIR, `${ROOT_DIR}/tsconfig.${name}.json`));
	await _run.parallel(es2015AotTasks);
	_log.done();

	/* FESM2015 Rollup */
	_log.task(`FESM2015 rollup`);
	let es2015RollupTasks = [];
	for (const name of PLAYER_NAMES) {
		es2015RollupTasks.push(_rollup.run({
			input: `${OUT}/${name}/${name}.js`,
			external: Object.keys(rollup_globals),
			plugins: [_rollup.plugin.license(), _rollup.plugin.sourcemap()]
		}, {
			file: `${OUT}/${name}/esm2015/index.js`,
			banner: rollup_banner
		}));
	}
	await _run.parallel(es2015AotTasks);
	_log.done();

	/* FESM5 AoT ngc */
	_log.task(`FESM5 AoT ngc`);
	let es5AotTasks = [];
	for (const name of PLAYER_NAMES)
		es5AotTasks.push(_ngc.aot(ROOT_DIR, `${ROOT_DIR}/tsconfig.${name}.json`, `--target es5 -d false --importHelpers true --sourceMap --outDir ${TMP_OUT}`));
	await _run.parallel(es5AotTasks);
	_log.done();

	/* FESM5 rollup */
	_log.task(`FESM5 rollup`);
	let es5RollupTasks = [];
	for (const name of PLAYER_NAMES) {
		es5RollupTasks.push(_rollup.run({
			input: `${TMP_OUT}/${name}/${name}.js`,
			external: Object.keys(rollup_globals),
			plugins: [_rollup.plugin.license(), _rollup.plugin.sourcemap()]
		}, {
			file: `${OUT}/${name}/esm5/index.js`,
			banner: rollup_banner
		}));
	}
	await _run.parallel(es5RollupTasks);
	_log.done();

	/* UMD Rollup */
	_log.task(`UMD rollup`);
	let umdRollupTasks = [];
	for (const name of PLAYER_NAMES) {
		umdRollupTasks.push(_rollup.run({
			input: `${OUT}/${name}/esm5/index.js`,
			external: Object.keys(rollup_globals),
			plugins: [_rollup.plugin.resolve(), _rollup.plugin.sourcemap()]
		}, {
			format: 'umd',
			file: `${OUT}/${name}/bundles/index.umd.js`,
			name: `bradmax.player.ng.${name}`,
			globals: rollup_globals,
			exports: 'named',
			amd: {
				id: `bradmax-player-ng-${name}`
			},
			banner: rollup_banner
		}));
	}
	await _run.parallel(umdRollupTasks);
	_log.done();

	/* UMD uglify */
	_log.task(`UMD uglify`);
	let umdUglifyTasks = [];
	for (const name of PLAYER_NAMES)
		umdUglifyTasks.push(_uglify.run(`${OUT}/${name}/bundles/index.umd.js`, `${OUT}/${name}/bundles/index.umd.min.js`));
	await _run.parallel(umdUglifyTasks);
	_log.done();

	/* CLEAN up */
	_log.task(`cleanup`);
	await _file.rimraf(`${OUT}/node_modules`);
	await _file.rimraf(`${OUT}/core/*.js`);
	await _file.rimraf(`${OUT}/core/*.js.map`);
	await _file.rimraf(`${OUT}/core/src/**/*.js`);
	await _file.rimraf(`${OUT}/core/src/**/*.js.map`);
	await _file.rmdir(TMP_OUT);
	for (const name of PLAYER_NAMES) {
		await _file.rimraf(`${OUT}/${name}/*.js`);
		await _file.rimraf(`${OUT}/${name}/*.js.map`);
		await _file.rimraf(`${OUT}/${name}/src/**/*.js`);
		await _file.rimraf(`${OUT}/${name}/src/**/*.js.map`);
	}
	_log.done();

	/* package.json */
	_log.task(`prepare package.json`);
	await _file.copy([`${ROOT_DIR}/package.json`], OUT);
	for (const name of PLAYER_NAMES)
		await _file.write(`${OUT}/${name}/package.json`, JSON.stringify({
			name: `@bradmax/player-ng/${name}`,
			version: PACKAGE.version,
			main: `./bundles/index.umd.min.js`,
			module: `./esm5/index.js`,
			es2015: `./esm2015/index.js`,
			typings: `./${name}.d.ts`
		}, null, '\t'));
	_log.done();

	/* COPY assets */
	_log.task(`copy assets`);
	await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], `${OUT}`);
	for (const name of PLAYER_NAMES)
		await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], `${OUT}/${name}`);
	_log.done();

	/* end */
	await _help.end(OUT, TGZ_DIR, PACKAGE);
}
