#! /usr/bin/env node

'use strict';

const _ts = require('typescript');
const _log = require('./../util/logger');
const _help = require('./../util/helper');

exports.Target = _ts.ScriptTarget;
exports.ModuleResolution = _ts.ModuleResolutionKind;
exports.ModuleKind = _ts.ModuleKind;

async function run(options) {
	return new Promise((resolve, reject) => {
		const program = _ts.createProgram(options.files, options);
		const emitResult = program.emit();
		// emitResult.emittedFiles.forEach(f => console.log(f));
		if (options.diagnostics) {
			const allDiagnostics = _ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
			allDiagnostics.forEach(diagnostic => {
				if (diagnostic.file) {
					let {
						line,
						character
					} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ? diagnostic.start : null);
					let message = _ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
					_log.verbose(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
				} else {
					_log.verbose(`${_ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
				}
			});
		}
		// if (emitResult.emitSkipped)
		// 	return reject();
		// else
		return resolve();
	});
}
exports.run = run;
