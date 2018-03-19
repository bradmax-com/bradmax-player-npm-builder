___
![Bradmax][bradmaxLogo]
![NodeJs][nodeLogo]
___
This node.js program builds [bradmax player][bradmax] npm packages for:

| plugin | npm | github | example |
| ---:|:--:|:--|:---|
| **angular js** | [@bradmax/player-ag][npm-player-ag] | [bradmax-com/bradmax-player-ag][git-player-ag] | [bradmax-com/bradmax-player-ag-example][git-player-ag-example] |
| **angular 5+** | [@bradmax/player-ng][npm-player-ng] | [bradmax-com/bradmax-player-ng][git-player-ng] | [bradmax-com/bradmax-player-ng-example][git-player-ng-example] |
| **reactJs**    | [@bradmax/player-rxjs][npm-player-rxjs] | [bradmax-com/bradmax-player-rxjs][git-player-rxjs] | [bradmax-com/bradmax-player-rxjs-example][git-player-rxjs-example] |
| *player js**   | [@bradmax/player-js][npm-player-js] | [bradmax-com/bradmax-player-js][git-player-js] | |

**bundle dependency of all above packages*
___
## Usage:
### 1. Install npm dependencies *(check details in `./package.json` file)*:
```
yarn install
```
*or just*
```
yarn
```
### 2. Edit  file `./setup.json` *(all paths are relative to project root directory)*:
```
{
	"bradmax-player": "./../../bs-player",
	"bradmax-player-js": "./package/player",
	"bradmax-player-ag": "./package/player-ag",
	"bradmax-player-ng": "./package/player-ng",
	"bradmax-player-rxjs": "./package/player-rxjs",
	"local-distribution-server-url": "http://localhost",
	"local-distribution-server-port": "6969"
}
```
- *`bradmax-player`* : , path to locale repo with bradmax player, used for building player javascript sources package,
- *`bradmax-player-js`* : path to bradmax player javascript git sub-module,
- *`bradmax-player-ag`* : path to bradmax player AngularJs git sub-module,
- *`bradmax-player-ng`* : path to bradmax player Angular git sub-module,
- *`bradmax-player-rxjs`* : path to bradmax player ReactJs git sub-module,
- *`local-distribution-server-url`* : url of distribution server,
- *`local-distribution-server-port`* : port of distribution server,

### 3. Run for details:

*if installed from* **npm**
```
bradmax --help
```
*else*
- node
```
node src/bradmax --help
```
- yarn
```
yarn bradmax --help
```
- npm
```
npm run bradmax -- --help
```
#### If your IDE is [VS Code][vscode] open debug panel and use one of predefined tasks.
tasks configuration can be found in[ *.vscode/launch.json*](.vscode/launch.json).
___
### Project structure
| | |
|:---|:---|
| `./.vscode/launch.json` | Visual Studio debug setup |
| `./dist` | npm packages output directory |
| `./package` | directory containing github submodules |
| `./src/package/**` | directory containing building tasks |
| `./src/tool/**` | directory containing building tools |
| `./src/util/**` | directory containing building utils |
| `./src/util/bradmax.js` | node.js bradmax program entry file |
___
#### License MIT 
___
More info @ [bradmax.com][bradmax]

[bradmax]: https://bradmax.com
[bradmax-doc-config]: https://bradmax.com/static/player-doc/configuration.html
[npm-player-ag]: https://npmjs.com/package/bradmax-player-ag
[npm-player-ng]: https://npmjs.com/package/bradmax-player-ng
[npm-player-rxjs]: https://npmjs.com/package/bradmax-player-rxjs
[npm-player-js]: https://npmjs.com/package/bradmax-player-js
[git-player-ag]: https://github.com/bradmax-com/bradmax-player-ag
[git-player-ag-example]: https://github.com/bradmax-com/bradmax-player-ag-example
[git-player-ng]: https://github.com/bradmax-com/bradmax-player-ng
[git-player-ng-example]: https://github.com/bradmax-com/bradmax-player-ng-example
[git-player-rxjs]: https://github.com/bradmax-com/bradmax-player-rxjs
[git-player-rxjs-example]: https://github.com/bradmax-com/bradmax-player-rxjs-example
[git-player-js]: https://github.com/bradmax-com/bradmax-player-js

[bradmaxLogo]: ./assets/md/bradmax.svg
[nodeLogo]: ./assets/md/node.svg

[vscode]: https://code.visualstudio.com/
