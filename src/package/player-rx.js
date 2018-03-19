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
const _tslint = require('./../tool/tslint');
const _tsc = require('./../tool/tsc');
const _rollup = require('./../tool/rollup');
const _uglify = require('./../tool/uglify');

/* VARIABLE */
const SETUP = require('./../../setup.json');
const ROOT_DIR = _help.root(SETUP['bradmax-player-rxjs']);
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
	// console.log(tslintResults);
	_log.done(`errorCount: ${tslintResults.errorCount} warningCount: ${tslintResults.warningCount}`);
	/* CREATE output */
	_log.task(`output directories`);
	await _file.mkdir(OUT);
	_log.done();
	/////
	/* Typescript */
	let tsconfig = {
		jsx: "react",
		typeAcquisition: {
			enable: true,
			include: [
				"bradmax"
			]
		},
		// paths: {
		// 	"tslib": "./../../node_modules/tslib"
		// },
		typeRoots: [
			`${ROOT_DIR}/node_modules/@types`,
			_help.root(`node_modules/@types`)
		],
		baseUrl: _help.root(''),
		basePath: `.`,
		moduleResolution: _tsc.ModuleResolution.NodeJs,
		module: _tsc.ModuleKind.ES5,
		lib: [`lib.es2015.d.ts`, `lib.dom.d.ts`],
		strict: true,
		skipLibCheck: true,
		experimentalDecorators: true,
		emitDecoratorMetadata: true,
		importHelpers: true,
		sourceMap: true,
		inlineSources: true,
		removeComments: true,
		noImplicitAny: true,
		noEmitOnError: false,
		listEmittedFiles: false,
		traceResolution: false,
		diagnostics: false, //_cli.verbose
		allowJs: false
	}
	const rollup_banner = `/* ${PACKAGE.name} v${PACKAGE.version} */`;
	const rollup_globals = {
		'react': 'react',
		'@bradmax/player/gorilla': 'bradmax',
		'@bradmax/player/mole': 'bradmax',
		'@bradmax/player/snake': 'bradmax',
		'@bradmax/player/zebra': 'bradmax',
		'@bradmax/player/version': 'bradmax.player.version'
	};

	/* TSC declarations */
	_log.task(`TSC declarations`);
	tsconfig.target = _tsc.Target.ES2015;
	tsconfig.declaration = true;
	let es2015TscTasks = [];
	for (const name of PLAYER_NAMES) {
		tsconfig.outDir = `${OUT}/${name}`;
		tsconfig.files = [`${ROOT_DIR}/src/${name}/index.tsx`];
		tsconfig.rootDirs = [`${ROOT_DIR}/src/${name}`];
		await _tsc.run(tsconfig);
	}
	await _run.parallel(es2015TscTasks);
	_log.done();

	/* FESM2015 Rollup */
	_log.task(`FESM2015 rollup`);
	let es2015RollupTasks = [];
	for (const name of PLAYER_NAMES)
		es2015RollupTasks.push(_rollup.run({
			input: `${OUT}/${name}/index.js`,
			external: Object.keys(rollup_globals),
			plugins: [_rollup.plugin.license(), _rollup.plugin.sourcemap(), _rollup.plugin.babel()]
		}, {
			file: `${OUT}/${name}/esm2015/index.js`,
			banner: rollup_banner
		}));
	await _run.parallel(es2015RollupTasks);
	_log.done();

	/* FESM5 */
	_log.task(`FESM5 tsc`);
	tsconfig.target = _tsc.Target.ES5;
	tsconfig.declaration = false;
	let es5TscTasks = [];
	for (const name of PLAYER_NAMES) {
		tsconfig.outDir = `${TMP_OUT}/${name}`;
		tsconfig.files = [`${ROOT_DIR}/src/${name}/index.tsx`];
		tsconfig.rootDirs = [`${ROOT_DIR}/src/${name}`];
		es5TscTasks.push(_tsc.run(tsconfig));
	}
	await _run.parallel(es5TscTasks);
	_log.done();

	/* FESM5 rollup */
	_log.task(`FESM5 rollup`);
	let es5RollupTasks = [];
	for (const name of PLAYER_NAMES)
		es5RollupTasks.push(_rollup.run({
			input: `${TMP_OUT}/${name}/index.js`,
			external: Object.keys(rollup_globals),
			plugins: [_rollup.plugin.license(), _rollup.plugin.sourcemap(), _rollup.plugin.babel()]
		}, {
			file: `${OUT}/${name}/esm5/index.js`,
			banner: rollup_banner
		}));
	await _run.parallel(es5RollupTasks);
	_log.done();

	/* UMD Rollup */
	_log.task(`UMD rollup`);
	let umdRollupTasks = [];
	for (const name of PLAYER_NAMES)
		umdRollupTasks.push(_rollup.run({
			input: `${OUT}/${name}/esm5/index.js`,
			external: Object.keys(rollup_globals),
			plugins: [_rollup.plugin.resolve(), _rollup.plugin.sourcemap()]
		}, {
			format: 'umd',
			file: `${OUT}/${name}/bundles/index.umd.js`,
			name: `bradmax.player.rx.${name}`,
			globals: rollup_globals,
			exports: 'named',
			amd: {
				id: `bradmax-player-rxjs-${name}`
			},
			banner: rollup_banner
		}));
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
	await _file.rimraf(`${OUT}/*.js`);
	await _file.rimraf(`${OUT}/*.js.map`);
	for (const name of PLAYER_NAMES) {
		await _file.rimraf(`${OUT}/${name}/*.js`);
		await _file.rimraf(`${OUT}/${name}/*.js.map`);
	}
	_log.done();

	/* package.json */
	_log.task(`prepare package.json`);
	await _file.copy([`${ROOT_DIR}/package.json`], OUT);
	for (const name of PLAYER_NAMES)
		await _file.write(`${OUT}/${name}/package.json`, JSON.stringify({
			name: `@bradmax/player-rx/${name}`,
			version: PACKAGE.version,
			main: `./bundles/index.umd.min.js`,
			module: `./esm5/index.js`,
			es2015: `./esm2015/index.js`,
			typings: `./index.d.ts`
		}, null, '\t'));
	_log.done();

	/* COPY assets */
	_log.task(`copy assets`);
	await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], `${OUT}`);
	_log.done();

	/* end */
	await _help.end(OUT, TGZ_DIR, PACKAGE);
}
