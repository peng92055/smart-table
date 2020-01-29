import './index.scss'

import initMixin from './core/core'

function Table(options) {
  if (!(this instanceof Table)) {
    console.error('Smart Table is a constructor and should be called with the `new` keyword')
  }
  //等待素材加载之后再初始化 保证cell的精准高宽
  window.addEventListener('load', () => {
    setTimeout(this._init(options), 0)
  })
}

initMixin(Table)

export default Table