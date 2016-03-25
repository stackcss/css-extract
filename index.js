const ConcatStream = require('concat-stream')
const staticModule = require('static-module')
const through = require('through2')
const assert = require('assert')
const fs = require('fs')

module.exports = cssExtract

// Extract CSS from a browserify bundle
// obj -> null
function cssExtract (bundle, opts) {
  opts = opts || {}

  var outFile = opts.out || opts.o || 'bundle.css'

  assert.equal(typeof bundle, 'object', 'bundle should be an object')
  assert.equal(typeof opts, 'object', 'opts should be an object')

  // every time .bundle is called, attach hook
  bundle.on('reset', addHooks)
  addHooks()

  function addHooks () {
    const writeStream = (typeof outFile === 'function')
      ? outFile()
      : ConcatStream(fs.writeFileSync.bind(fs, outFile))

    // run before the "label" step in browserify pipeline
    // this makes sure insert-css requires are found before plugins like bundle-collapser run
    bundle.pipeline.get('label').unshift(through.obj(write, flush))

    function write (chunk, enc, cb) {
      // A small performance boost: don't do ast parsing unless we know it's needed
      if (String(chunk.source).indexOf('insert-css') === -1) {
        return cb(null, chunk)
      }

      var sm = createStaticModule(writeStream)
      sm.write(chunk.source)
      sm.pipe(ConcatStream(function (source) {
        // chunk.source is expected to be a string
        chunk.source = String(source)
        cb(null, chunk)
      }))
      sm.end()
    }

    // close stream and signal end
    function flush (cb) {
      writeStream.end()
      cb()
    }
  }
}

function createStaticModule (writeStream) {
  return staticModule({
    'insert-css': writeStream.write.bind(writeStream)
  })
}
