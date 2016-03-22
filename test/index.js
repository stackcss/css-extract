const browserify = require('browserify')
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

  t.test('should leave non-matching insert-css statements inline', function (t) {
    t.plan(4)

    browserify(path.join(__dirname, 'manual-insert-source.js'))
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
      const source = fs.readFileSync(path.join(__dirname, 'manual-insert-source.js'), 'utf8')
      t.ok(String(data).indexOf(String(source)) !== -1, 'source is still in built bundle')
    }
  })
})
