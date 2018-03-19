#! /usr/bin/env node

'use strict';

async function parallel(promisses) {
	return new Promise(async (resolve, reject) => {
		try {
			resolve(await Promise.all(promisses));
		}
		catch(error) {
			reject(error)
		}
	});
}
exports.parallel = parallel;
