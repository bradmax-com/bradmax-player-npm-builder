#! /usr/bin/env node

'use strict';

/* IMPORT */
const _fs = require('fs');
const _cli = require('commander');
const _log = require('./../util/logger');
const _help = require('./../util/helper');
const _file = require('./../util/file');
const _yarn = require('./../tool/yarn');
const _tslint = require('./../tool/tslint');
const _ant = require('./../tool/ant');
const _git = require('./../tool/git');
const _tsc = require('./../tool/tsc');
const _rollup = require('./../tool/rollup');
const _uglify = require('./../tool/uglify');

/* VARIABLE */
const SETUP = require('./../../setup.json');
const BRADMAX_DIR = _help.root(SETUP['bradmax-player']);
const ROOT_DIR = _help.root(SETUP['bradmax-player-js']);
const OUT = `${ROOT_DIR}/dist`;
const NS_OUT = `${OUT}/ns`;
const VERSION_OUT = `${OUT}/version`;
const ESM2015_OUT = `${OUT}/esm2015`;
const ESM5_OUT = `${OUT}/esm5`;
const UMD_OUT = `${OUT}/bundles`;
const TMP_OUT = `${OUT}/tmp`;

/* EXPORT */
exports.build = build;
async function build(PACKAGE, PLAYER_NAMES, TGZ_DIR) {
	let tsconfig = {
		files: [
			`${ROOT_DIR}/version/index.ts`,
			`${ROOT_DIR}/ns/index.d.ts`
		],
		rootDirs: [
			`${ROOT_DIR}/ns`,
			`${ROOT_DIR}/version`
		],
		typeRoots: [
			_help.root(`node_modules/@types`)
		],
		paths: {
			"tslib": [_help.root(`/node_modules/tslib/tslib.d.ts`)],
			"node": [_help.root(`/node_modules/@types/node.d.ts`)],
			"events": [_help.root(`/node_modules/events/events.js`)]
		},
		baseUrl: _help.root(''),
		basePath: `.`,
		moduleResolution: _tsc.ModuleResolution.NodeJs,
		module: _tsc.ModuleKind.ES2015,
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
		noEmitOnError: true,
		listEmittedFiles: false,
		traceResolution: false,
		diagnostics: _cli.verbose
	}
	let pkg = {
		src: null,
		ns: null,
		version: null
	};
	const pkgk = Object.keys(pkg);
	const rollup_banner = `/* ${PACKAGE.name} v${PACKAGE.version} */`;

	/* READ package.json */
	_log.task(`reading package.json`);
	for (const i in pkgk) {
		const nme = pkgk[i];
		const pth = i == 0 ? ROOT_DIR : `${ROOT_DIR}/${nme}`;
		pkg[nme] = await _file.json(`${pth}/package.json`);
	}
	_log.done();

	/* CREATE output */
	_log.task(`output directories`);
	await _file.mkdir(OUT);
	_log.done();

	/* build players */
	if (_cli.compilePlayer) {
		_log.task(`build players for npm`);
		await _ant.build(BRADMAX_DIR);
		_log.done();
	}

	/* Copy players */
	_log.task(`copy players`);
	for (const name of PLAYER_NAMES) {
		const playerDir = `${OUT}/${name}`;
		await _file.mkdir(playerDir);
		await _file.copy([`${BRADMAX_DIR}/bin/for_npm/${name}.js`], playerDir, `index.js`);
	}
	_log.done();

	/* NAMESPACE */
	_log.task(`player namespace`);
	await _file.mkdir(NS_OUT);
	await _file.copy([`${ROOT_DIR}/ns/index.d.ts`], NS_OUT);
	_log.done();

	/* VERSIONS */
	_log.task(`update player version`);
	const playerVersion = `${await _git.version(BRADMAX_DIR)}`.trim();
	await _file.write(`${ROOT_DIR}/version/index.ts`, `export const BRADMAX_PLAYER_VERSION = '${playerVersion}';`);
	_log.done(playerVersion);

	/* Typescript */
	_log.task(`typescript declarations`);
	tsconfig.target = _tsc.Target.ES2015;
	tsconfig.declaration = true;
	tsconfig.outDir = VERSION_OUT;
	await _tsc.run(tsconfig);
	_log.done();

	/* FESM2015 Rollup */
	_log.task(`ESM2015 rollup`);
	await _rollup.run({
		input: `${VERSION_OUT}/index.js`,
		plugins: [_rollup.plugin.license(), _rollup.plugin.sourcemap()]
	}, {
		file: `${ESM2015_OUT}/version/index.js`,
		banner: rollup_banner
	});
	_log.done();

	/* FESM5 Typescript */
	_log.task(`FESM5 typescript`);
	tsconfig.target = _tsc.Target.ES5;
	tsconfig.declaration = false;
	tsconfig.outDir = `${TMP_OUT}/version`;
	await _tsc.run(tsconfig);
	_log.done();

	/* FESM5 Rollup */
	_log.task(`FESM5 rollup`);
	await _rollup.run({
		input: `${TMP_OUT}/version/index.js`,
		plugins: [_rollup.plugin.license(), _rollup.plugin.sourcemap()]
	}, {
		file: `${ESM5_OUT}/version/index.js`,
		banner: rollup_banner
	});
	await _file.rmdir(TMP_OUT);
	_log.done();

	/* UMD Rollup */
	_log.task(`UMD rollup`);
	await _rollup.run({
		input: `${ESM5_OUT}/version/index.js`,
		plugins: [_rollup.plugin.resolve(), _rollup.plugin.sourcemap()]
	}, {
		format: 'umd',
		file: `${UMD_OUT}/version/index.umd.js`,
		name: `bradmax.player.version`,
		exports: 'named',
		amd: {
			id: `bradmax-player-version`
		},
		banner: rollup_banner
	});
	_log.done();

	/* UMD uglify */
	_log.task(`UMD uglify`);
	await _uglify.run(`${UMD_OUT}/version/index.umd.js`, `${UMD_OUT}/version/index.umd.min.js`);
	_log.done();

	/* CLEAN up */
	_log.task(`cleanup`);
	await _file.unlink(`${VERSION_OUT}/index.js`);
	await _file.unlink(`${VERSION_OUT}/index.js.map`);
	_log.done();

	/* package.json */
	_log.task(`prepare package.json`);
	await _file.copy([`${ROOT_DIR}/package.json`], OUT);
	for (const name of PLAYER_NAMES) {
		await _file.write(`${OUT}/${name}/package.json`, JSON.stringify({
			name: `${PACKAGE.name}/${name}`,
			version: PACKAGE.version,
			main: `./index.js`,
			typings: "./../ns/index.d.ts"
		}, null, '\t'));
	}
	pkg.ns.version = PACKAGE.version;
	await _file.write(`${NS_OUT}/package.json`, JSON.stringify(pkg.ns, null, '\t'));
	pkg.version.version = PACKAGE.version;
	await _file.write(`${VERSION_OUT}/package.json`, JSON.stringify(pkg.version, null, '\t'));
	_log.done();

	/* COPY assets */
	_log.task(`copy assets`);
	await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], OUT);
	await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], NS_OUT);
	await _file.copy([_help.root(`LICENSE`), `${ROOT_DIR}/README.md`], VERSION_OUT);
	_log.done();

	/* end */
	await _help.end(OUT, TGZ_DIR, PACKAGE);
}
