#! /usr/bin/env node

'use strict';
const {
	spawn
} = require('child_process');
const _cli = require('commander');
const _log = require('./../util/logger');


async function pack(dir, filename = null) {
	return new Promise(async (resolve, reject) => {
		let args = [`pack`];
		if (filename)
			args = args.concat([`-f`, filename]);
		args = args.concat([`--no-emoji`, `--no-progress`]);
		const program = spawn(`yarn`, args, {
			cwd: dir
		});
		if (_cli.verbose)
			program.stdout.on('data', data => _log.verbose(`YARN`, data.toString()));
		let error = null;
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:YARN`, data.toString());
		});
		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`YARN:FAIL: ${error}`);
		});
	});
}
exports.pack = pack;

async function install(dir, link = null, linkFlags = '') {
	return new Promise(async (resolve, reject) => {
		let args = ['--no-emoji', '--no-progress'];
		if (link)
			args = ['add', link].concat(linkFlags).concat(args);
		const program = spawn('yarn', args, {
			cwd: dir
		});
		if (_cli.verbose)
			program.stdout.on('data', data => _log.verbose(`YARN`, data.toString()));
		let error = null;
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:YARN`, data.toString());
		});
		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`YARN:FAIL: ${error}`);
		});
	});
}
exports.install = install;

async function uninstall(dir, link, linkFlags = '') {
	return new Promise(async (resolve, reject) => {
		let args = ['--no-emoji', '--no-progress'];
		if (link)
			args = ['remove', link].concat(linkFlags).concat(args);
		const program = spawn('yarn', args, {
			cwd: dir
		});
		if (_cli.verbose)
			program.stdout.on('data', data => _log.verbose(`YARN`, data.toString()));
		let error = null;
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:YARN`, data.toString());
		});
		program.on('exit', (code) => {
			program.unref();
			resolve();
		});
	});
}
exports.uninstall = uninstall;

async function clean() {
	return new Promise((resolve, reject) => {
		const program = spawn('yarn', ['cache', 'clean']);
		if (_cli.verbose)
			program.stdout.on('data', data => _log.verbose(`YARN`, data.toString()));
		let error = null;
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:YARN`, data.toString());
		});
		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`YARN:FAIL: ${error}`);
		});
	});
}
exports.clean = clean;

async function link(dir, flags = []) {
	return new Promise((resolve, reject) => {
		const program = spawn('yarn', ['link'].concat(flags), {
			cwd: dir
		});
		if (_cli.verbose)
			program.stdout.on('data', data => _log.verbose(`YARN`, data.toString()));
		let error = null;
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:YARN`, data.toString());
		});
		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`YARN:FAIL: ${error}`);
		});
	});
}
exports.link = link;

async function unlink(name) {
	return new Promise((resolve, reject) => {
		const args = ['unlink', name];
		const program = spawn('yarn', args);
		if (_cli.verbose)
			program.stdout.on('data', data => _log.verbose(`YARN`, data.toString()));
		let error = null;
		program.stderr.on('data', data => {
			error = data.toString();
			_log.verbose(`ERROR:YARN`, data.toString());
		});
		program.on('exit', (code) => {
			program.unref();
			if (code == 0) resolve();
			else reject(`YARN:FAIL: ${error}`);
		});
	});
}
exports.unlink = unlink;
