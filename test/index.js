const browserify = require('browserify')
const tmpDir = require('tmp').dir
const path = require('path')
const test = require('tape')
const bl = require('bl')
const fs = require('fs')

const cssExtract = require('../')

test('css-extract', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(2)
    t.throws(cssExtract, /object/)
    t.throws(cssExtract.bind(null, {}), 123, /object/)
  })

  t.test('should extract sheetify css to given stream', function (t) {
    t.plan(2)
    browserify(path.join(__dirname, 'source.js'))
      .transform('sheetify/transform')
      .plugin(cssExtract, { out: createWs })
      .bundle()

    function createWs () {
      return bl(function (err, data) {
        t.ifError(err, 'no error')
        const exPath = path.join(__dirname, './expected.css')
        const expected = fs.readFileSync(exPath, 'utf8').trim() + '\n'
        t.equal(String(data), expected, 'extracted all the CSS')
      })
    }
  })

  t.test('should extract sheetify css to file', function (t) {
    t.plan(3)
    tmpDir({ unsafeCleanup: true }, onDir)

    function onDir (err, dir, cleanup) {
      t.ifError(err, 'no error')
      const outFile = path.join(dir, 'out.css')

      browserify(path.join(__dirname, 'source.js'))
        .transform('sheetify/transform')
        .plugin(cssExtract, { out: outFile })
        .bundle(function (err) {
          t.ifError(err, 'no bundle error')

          const exPath = path.join(__dirname, './expected.css')
          const expected = fs.readFileSync(exPath, 'utf8').trim()
          const actual = fs.readFileSync(outFile, 'utf8').trim()
          t.equal(expected, actual, 'all css written to file')

          cleanup()
        })
    }
  })

  t.test('should extract static insert-css statements', function (t) {
    t.plan(2)
    browserify(path.join(__dirname, 'source-static.js'))
      .plugin(cssExtract, { out: createWs })
      .bundle()

    function createWs () {
      return bl(function (err, data) {
        t.ifError(err, 'no error')
        const exPath = path.join(__dirname, './expected-static.css')
        const expected = fs.readFileSync(exPath, 'utf8').trim() + '\n'
        t.equal(String(data), expected, 'extracted all the CSS')
      })
    }
  })

  t.test('should extract static sheetify/insert statements', function (t) {
    t.plan(2)
    browserify(path.join(__dirname, 'source-sf-static.js'))
      .plugin(cssExtract, { out: createWs })
      .bundle()

    function createWs () {
      return bl(function (err, data) {
        t.ifError(err, 'no error')
        const exPath = path.join(__dirname, './expected-sf-static.css')
        const expected = fs.readFileSync(exPath, 'utf8').trim() + '\n'
        t.equal(String(data), expected, 'extracted all the CSS')
      })
    }
  })

  t.test('should not extract dynamic insert-css statements', function (t) {
    t.plan(4)
    const sourcePath = path.join(__dirname, 'source-dynamic.js')

    browserify(sourcePath)
      .plugin(cssExtract, { out: readCss })
      .bundle(readJs)

    function readCss () {
      return bl(function (err, data) {
        t.ifError(err, 'no error')
        t.equal(String(data), '', 'no css extracted')
      })
    }

    function readJs (err, data) {
      t.ifError(err, 'no error')
      const source = fs.readFileSync(sourcePath, 'utf8')
      t.ok(String(data).indexOf(String(source)) !== -1, 'source is still in built bundle')
    }
  })

  t.test('should not extract dynamic insert-css statements, again', function (t) {
    t.plan(4)
    const sourcePath = path.join(__dirname, 'source-dynamic-2.js')

    browserify(sourcePath)
      .plugin(cssExtract, { out: readCss })
      .bundle(readJs)

    function readCss () {
      return bl(function (err, data) {
        t.ifError(err, 'no error')
        t.equal(String(data), '', 'no css extracted')
      })
    }

    function readJs (err, data) {
      t.ifError(err, 'no error')
      const source = fs.readFileSync(sourcePath, 'utf8')
      t.ok(String(data).indexOf(String(source)) !== -1, 'source is still in built bundle')
    }
  })
})
