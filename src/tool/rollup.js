#! /usr/bin/env node

'use strict';

const {
	spawn
} = require('child_process');
const _cli = require('commander');
const _rollup = require('rollup');
const _log = require('./../util/logger');
const _help = require('./../util/helper');
const _rollup_resolve = require('rollup-plugin-node-resolve');
const _rollup_sourcemaps = require('rollup-plugin-sourcemaps');
const _rollup_license = require('rollup-plugin-license');
const _rollup_babel = require('rollup-plugin-babel');

const plugins = {
	babel: () => _rollup_babel({
		exclude: '**/node_modules/**'
	}),
	resolve: () => _rollup_resolve(),
	sourcemap: () => _rollup_sourcemaps(),
	license: () => _rollup_license({
		sourceMap: true,
		banner: {
			file: _help.root('BANNER.txt'),
			encoding: 'utf-8',
		}
	}),
}
exports.plugin = plugins;

async function run(inputOptions, outputOptions) {
	return new Promise(async (resolve, reject) => {
		const i = {
			// core options
			// input: `${OUT}/${name}/esm5/index.js`, // the only required option
			// external: Object.keys(globals),
			// plugins: [_rollup_resolve(), _rollup_sourcemaps()],
			// advanced options
			onwarn: ({
				loc,
				frame,
				message
			}) => {
				if (loc) {
					_log.verbose(`ROLLUP: ${loc.file} (${loc.line}:${loc.column})`,`${message}`);
					if (frame)
						_log.verbose(`ROLLUP`,frame);
				} else {
					_log.verbose(`ROLLUP`, message);
				}
				return;
			},
			// cache,
			//// danger zone
			// acorn, acornInjectPlugins, treeshake, context, moduleContext, legacy,
			//// experimental
			// experimentalDynamicImport, experimentalCodeSplitting
		};
		if (inputOptions)
			Object.keys(inputOptions).forEach(k => i[k] = inputOptions[k]);
		const o = {
			// core options
			format: 'es', // required
			// file: `${OUT}/${name}/bundles/index.umd.js`,
			// dir,
			// name: `bradmax.player.ng.${name}`,
			// globals: globals,
			//// advanced options
			// paths, intro, outro,
			banner: '/* bradmax.com */',
			footer: '/* bradmax.com */',
			sourcemap: true,
			// sourcemapFile, interop, extend,
			//// danger zone
			// exports: 'named',
			// amd: {
			// 	id: `bradmax-player-ng-${name}`
			// },
			// indent, strict, freeze
		};
		if (outputOptions)
			Object.keys(outputOptions).forEach(k => o[k] = outputOptions[k]);

		try {
			const bundle = await _rollup.rollup(i);
			await bundle.write(o);

		} catch (e) {
			reject(e)
		}

		resolve();
	});
}
exports.run = run;
