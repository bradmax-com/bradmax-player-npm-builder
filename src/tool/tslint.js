#! /usr/bin/env node

'use strict';
const _tslint = require('tslint');
const {
	spawn
} = require('child_process');
const _log = require('./../util/logger');
const _help = require('./../util/helper');
const _file = require('./../util/file');

async function run(dir, tsconfigFile, tslintFile, options) {
	return new Promise(async (resolve, reject) => {
		// console.log('dir', dir);
		// console.log('tsconfigFile', tsconfigFile);
		// console.log('tslintFile', tslintFile);
		// console.log('options', options);
		try {
			const program = _tslint.Linter.createProgram(tsconfigFile, dir);
			const linter = new _tslint.Linter(options, program);
			// console.log('linter', linter);
			const files = _tslint.Linter.getFileNames(program);
			files.forEach(file => {
				const fileContents = program.getSourceFile(file).getFullText();
				// console.log('file: ' + file);
				const configuration = _tslint.Configuration.findConfiguration(tslintFile, file).results;
				linter.lint(file, fileContents, configuration);
			});
			let errors = [];
			const missingFilePaths = linter.program.getMissingFilePaths();
			missingFilePaths.forEach(d => errors.push({
				type: `Missing File`,
				text: d.messageText,
				file: d.file.path
			}));
			const syntacticDiagnostics = linter.program.getSyntacticDiagnostics();
			syntacticDiagnostics.forEach(d => errors.push({
				type: `Syntactic Diagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			const optionsDiagnostics = linter.program.getOptionsDiagnostics();
			optionsDiagnostics.forEach(d => errors.push({
				type: `Options Diagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			const globalDiagnostics = linter.program.getGlobalDiagnostics();
			globalDiagnostics.forEach(d => errors.push({
				type: `Global Diagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			const semanticDiagnostics = linter.program.getSemanticDiagnostics();
			semanticDiagnostics.forEach(d => errors.push({
				type: `Semantic Diagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			const declarationDiagnostics = linter.program.getDeclarationDiagnostics();
			declarationDiagnostics.forEach(d => errors.push({
				type: `Declaration Diagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			const fileProcessingDiagnosticsObject = linter.program.getFileProcessingDiagnostics();
			const fileProcessingGlobalDiagnostics = fileProcessingDiagnosticsObject.getGlobalDiagnostics();
			fileProcessingGlobalDiagnostics.forEach(d => errors.push({
				type: `FileProcessingGlobalDiagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			const fileProcessingDiagnostics = fileProcessingDiagnosticsObject.getDiagnostics();
			fileProcessingDiagnostics.forEach(d => errors.push({
				type: `FileProcessingDiagnostic`,
				text: d.messageText,
				file: d.file.path
			}));
			if (errors.length == 0) {
				const results = linter.getResult();
			// console.log(results);
				resolve(results);
			} else {
				errors.forEach(e => _log.error(`${e.type} : ${e.text} : ${e.file}`));
				reject('TSLint Diagnostic errors');
			}
		} catch (e) {
			reject(e);
		}
	});
}
module.exports.run = run;


async function old(dir, config, pattern) {
	return new Promise((resolve, reject) => {
		const program = spawn(`${_help.BIN_ROOT}/tslint`, [`-p`, config, `-t`, `stylish`, pattern], {
			cwd: dir
		});
		// log errors
		let error = null;
		program.stdout.on('data', data => {
			error = data.toString();
			_log.verbose(`TSLINT`, data.toString());
		});
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:TSLINT`, data.toString());
		});
		program.on('exit', code => {
			program.unref();
			switch (code) {
				case 0:
					resolve();
					break;
				case 1:
					reject(`TSLint errorAn invalid command line argument or combination thereof was used\n${error}`);
					break;
				case 2:
					reject(`TSLint errorLinting failed with one or more rule violations with severity error`);
					break;
				default:
					reject(`UNKNOWN:EXIT:CODE`);
					break;
			}
		});
	});
}
module.exports.old = old;
