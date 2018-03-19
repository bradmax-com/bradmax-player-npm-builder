#! /usr/bin/env node

'use strict';

const _fs = require('fs');
const _rf = require('rimraf');
const _help = require('./helper');

/* rimraf */
async function rimraf(path) {
	return new Promise((resolve, reject) => _rf(path, (e) => { if (e) reject(e); else resolve(); }));
};
exports.rimraf = rimraf

/* exist */
async function exist(path) {
	return new Promise((resolve, reject) => _fs.exists(path, (exists) => resolve(exists)));
};
exports.exist = exist;


/* mkdir */
async function mkdir(path) {
	return new Promise(async (resolve, reject) => {
		const ok = await exist(path);
		if (ok)
			await this.rmdir(path);
		// if (debug) _log.debug(`mkdir: ${path}`);
		return _fs.mkdir(path, e => {
			if (e) reject(e);
			resolve();
		});
	});
}
exports.mkdir = mkdir;

/* rmdir */
async function rmdir(path) {
	return new Promise(async (resolve, reject) => {
		const ok = await exist(path);
		if (ok) {
			await rmdirList(path);
			// if (debug) _log.debug(`rmdir: ${path}`);
			_fs.rmdir(path, e => {
				if (e) reject(e);
				resolve();
			});
		}
	});
}
exports.rmdir = rmdir;

/* unlink */
async function unlink(path) {
	return new Promise(async (resolve, reject) => {
		const ok = await exist(path);
		if (ok) {
			// if (debug) _log.debug(`unlink: ${path}`);
			_fs.unlink(path, e => {
				if (e) return reject(e);
				resolve();
			});
		}
	});
}
exports.unlink = unlink;

/* readdir */
async function readdir(path) {
	return new Promise(async (resolve, reject) => {
		const ok = await exist(path);
		if (ok) {
			// if (debug) _log.debug(`readdir: ${path}`);
			_fs.readdir(path, (e, list) => {
				if (e) return reject(e);
				resolve(list);
			});
		}
	});
}
exports.readdir = readdir;

/* stat */
async function stat(path) {
	return new Promise(async (resolve, reject) => {
		const ok = await exist(path);
		if (ok) {
			// if (debug) _log.debug(`stat: ${path}`);
			_fs.stat(path, (e, stat) => {
				if (e) return reject(e);
				resolve(stat);
			});
		}
	});
}
exports.stat = stat;

/* write */
async function write(path, data) {
	return new Promise(async (resolve, reject) => {
		_fs.writeFile(path, data, {
			encoding: 'utf-8'
		}, e => {
			if (e) return reject(e);
			resolve();
		});
	});
}

exports.write = write;

/* read */
async function read(path, data) {
	return new Promise(async (resolve, reject) => {
		_fs.readFile(path, 'utf8', (e, d) => {
			if (e) return reject(e);
			resolve(d);
		});
	});
}

exports.read = read;

/* rename */
async function rename(oldPath, newPath) {
	return new Promise(async (resolve, reject) => {
		_fs.rename(oldPath, newPath, (e, d) => {
			if (e) return reject(e);
			resolve(d);
		});
	});
}

exports.rename = rename;

/* copy */
async function copy(files, dir, renameTo = null) {
	return new Promise(async (resolve, reject) => {
		for (let f of files) {
			const n = renameTo ? renameTo : f.split('/').pop();
			const d = `${dir}/${n}`;
			// _log.debug(`copy:${f}`);
			// _log.debug(`dest:${d}`);
			await copyFile(f, d);
		};
		resolve();
	});
}
exports.copy = copy;

/* json */
async function json(file) {
	return new Promise(async (resolve, reject) => {
		const exist = await this.exist(file, false);
		if (!exist)
			return reject(`JSON DON'T EXIST: ${file}`);
		const data = await this.read(file);
		const obj = JSON.parse(data);
		return resolve(obj);
	});
}
exports.json = json;

/* rmdir/rmList */
async function copyFile(from, to) {
	return new Promise(async (resolve, reject) => {
		_fs.copyFile(from, to, e => {
			if (e) return reject(e);
			resolve();
		});
	});
}

/* rmdir/rmList */
async function rmdirList(dir, list) {
	return new Promise(async (resolve, reject) => {
		const list = await readdir(dir, false);
		for (let f of list) {
			const filename = `${dir}/${f}`;
			const filenstat = await stat(filename, false);
			if (filenstat.isDirectory())
				await rmdir(filename);
			else
				await unlink(filename);
		};
		resolve();
	});
}
