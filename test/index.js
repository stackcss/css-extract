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

  t.test('should extract css', function (t) {
    t.plan(2)
    browserify(path.join(__dirname, 'source.js'))
      .transform('sheetify/transform')
      .plugin(cssExtract, { out: createWs })
      .bundle()

    function createWs () {
      return bl(function (err, data) {
        t.ifError(err, 'no error')
        const exPath = path.join(__dirname, './expected.css')
        const expected = fs.readFileSync(exPath, 'utf8').trim()
        t.equal(String(data), expected, 'extracted all the CSS')
      })
    }
  })

  t.test('should write file', function (t) {
    t.plan(3)
    tmpDir({unsafeCleanup: true}, onDir)

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
})
