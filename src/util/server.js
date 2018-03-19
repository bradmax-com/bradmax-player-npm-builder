const _cli = require('commander');
const _express = require('express');
const _log = require('./../util/logger');
const _help = require('./../util/helper');
const _file = require('./../util/file');

const SETUP = require('./../../setup.json');
const DIST_URL = SETUP['local-distribution-server-url'];
const DIST_PORT = Number(SETUP['local-distribution-server-port']);
const DIST_HOST = `${DIST_URL}:${DIST_PORT}`;
exports.DIST_HOST = DIST_HOST;

exports.PLAYER_JS = `${DIST_HOST}/js`;
exports.PLAYER_AG = `${DIST_HOST}/ag`;
exports.PLAYER_NG = `${DIST_HOST}/ng`;
exports.PLAYER_RX = `${DIST_HOST}/rx`;

let server;
/// server
async function startServer(version) {
	_log.task(`start distribution server @ ${DIST_HOST}`);
	try {
		server = await distributionServer({
			[`js`]: `bradmax-player-v${version}.tgz`,
			[`ag`]: `bradmax-player-ag-v${version}.tgz`,
			[`ng`]: `bradmax-player-ng-v${version}.tgz`,
			[`rx`]: `bradmax-player-rx-v${version}.tgz`
		});
	} catch (e) {
		_log.error(e);
		if (server) server.close();
		_log.log('EXIT:ON:ERROR');
		process.exit(1);
	}
	_log.done();
	// finally {
	// 	if (server) server.close();
	// 	_log.log('EXIT');
	// 	process.exit(0);
	// }
}
exports.startServer = startServer;

async function stopServer() {
	if (server) server.close();
}
exports.stopServer = stopServer;

//

async function distributionServer(map) {
	return new Promise((resolve, reject) => {
		const app = _express();
		Object.keys(map).forEach(k => {
			app.get(`/${k}`, (req, res, next) => res.download(_help.root(`dist/${map[k]}`), map[k]));
		});
		const server = app.listen(DIST_PORT, () => {
			resolve(server);
		});
	});
}
