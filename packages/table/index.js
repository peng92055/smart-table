import './index.scss'

import initMixin from './src/core'

function Table(options) {
  if (!(this instanceof Table)) {
    console.error('Smart Table is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Table)

export default Table
