const isRequire = require('is-require')()
const through = require('through2')
const falafel = require('falafel')
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
    // run before the "debug" step in browserify pipeline
    bundle.pipeline.get('debug').unshift(through.obj(write, flush))
    const writeStream = (typeof outFile === 'function')
      ? outFile()
      : fs.createWriteStream(outFile)

    function write (chunk, enc, cb) {
      const css = extract(chunk)
      writeStream.write(css)
      cb(null, chunk)
    }

    // close stream and signal end
    function flush (cb) {
      writeStream.end()
      cb()
    }
  }
}

// extract css from chunks
// obj -> str
function extract (chunk) {
  const css = []
  const ast = falafel(chunk.source, { ecmaVersion: 6 }, walk)
  chunk.source = ast.toString()
  return css.join('\n')

  function walk (node) {
    if (!isRequire(node)) return
    if (!node.arguments) return
    if (!node.arguments[0]) return
    if (node.arguments[0].value !== 'insert-css') return
    css.push(node.parent.arguments[0].value)
    node.parent.update('0')
  }
}
