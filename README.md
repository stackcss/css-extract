# css-extract [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Looks up `require('insert-css')` calls to extract CSS from a browserify bundle
to a file. Useful with `sheetify` or any other package / transform that uses
`insert-css`.

## Command line
```sh
$ browserify -t sheetify/transform -p [ css-extract -o bundle.css ] index.js \
  -o bundle.js
```

## JS api
```js
const browserify = require('browserify')

browserify()
  .transform('sheetify/transform')
  .plugin('css-extract', { out: 'bundle.css' })
  .bundle()
```

```js
const browserify = require('browserify')

browserify()
  .transform('sheetify/transform')
  .plugin('css-extract', { out: createWriteStream })
  .bundle()

function createWriteStream () {
  return process.stdout
}
```

## Options
- `-o` / `--out`: specify an outfile, defaults to `bundle.css`. Can also be a
  function that returns a writable stream from the JavaScript API.

## Installation
```sh
$ npm install css-extract
```

## See Also
- [sheetify](https://github.com/stackcss/sheetify)
- [insert-css](https://github.com/substack/insert-css)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/css-extract.svg?style=flat-square
[3]: https://npmjs.org/package/css-extract
[4]: https://img.shields.io/travis/stackcss/css-extract/master.svg?style=flat-square
[5]: https://travis-ci.org/stackcss/css-extract
[6]: https://img.shields.io/codecov/c/github/stackcss/css-extract/master.svg?style=flat-square
[7]: https://codecov.io/github/stackcss/css-extract
[8]: http://img.shields.io/npm/dm/css-extract.svg?style=flat-square
[9]: https://npmjs.org/package/css-extract
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
