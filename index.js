const staticModule = require('static-module')
const from2 = require('from2-string')
const through = require('through2')
const assert = require('assert')
const d = require('defined')
const bl = require('bl')
const fs = require('fs')

module.exports = cssExtract

// Extract CSS from a browserify bundle
// obj -> null
function cssExtract (bundle, opts) {
  opts = opts || {}

  var outFile = opts.out || opts.o || 'bundle.css'
  var sourceMap = d(opts.sourceMap, bundle && bundle._options && bundle._options.debug, false)

  assert.strictEqual(typeof bundle, 'object', 'bundle should be an object')
  assert.strictEqual(typeof opts, 'object', 'opts should be an object')

  // every time .bundle is called, attach hook
  bundle.on('reset', addHooks)
  addHooks()

  function addHooks () {
    const extractStream = through.obj(write, flush)
    const writeStream = (typeof outFile === 'function')
      ? outFile()
      : bl(writeComplete)

    // run before the "label" step in browserify pipeline
    bundle.pipeline.get('label').unshift(extractStream)

    function write (chunk, enc, cb) {
      // Performance boost: don't do ast parsing unless we know it's needed
      if (!/(insert-css|sheetify\/insert)/.test(chunk.source)) {
        return cb(null, chunk)
      }

      var source = from2(chunk.source)
      var sm = staticModule({
        'insert-css': function (src) {
          writeStream.write(String(src) + '\n')
          return from2('null')
        },
        'sheetify/insert': function (src) {
          writeStream.write(String(src) + '\n')
          return from2('null')
        }
      }, { sourceMap: sourceMap })

      source.pipe(sm).pipe(bl(complete))

      function complete (err, source) {
        if (err) return extractStream.emit('error', err)
        chunk.source = String(source)
        cb(null, chunk)
      }
    }

    // close stream and signal end
    function flush (cb) {
      writeStream.end()
      cb()
    }

    function writeComplete (err, buffer) {
      if (err) return extractStream.emit('error', err)
      fs.writeFileSync(outFile, buffer)
    }
  }
}
