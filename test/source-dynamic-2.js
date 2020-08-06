var insertCss = require('insert-css')

insert('.foo {}')

function insert (foo) {
  insertCss(foo)
}
