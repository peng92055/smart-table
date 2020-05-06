import sort from './vdom';
import {
  setAttribute,
  removeAttribute,
  hasAttribute,
  getAttribute,
  appendChild,
  appendChildren,
  removeChild,
  createElement,
  querySelector,
  insertBefore,
  querySelectorAll,
  offsetHeight,
  offsetWidth,
  styled
} from './node-ops';
import createFixed from './fixed';
import {
  throttle,
  debounce,
  getAttrNumber,
  createCheckbox,
  createExpandTrigger,
  refactorCell,
  replaceColGroup,
  createTableWrapper,
  getEmptyIndexInArray,
} from './utils';
import scrollBarWidth from './scrollbar-width';

export default function initMixin(Table) {
  Table.prototype._init = function (options = {}) {
    if (!options.selector) {
      return console.error("Smart Table init need a selector")
    }
    const selector = String(options.selector).trim()
    const root = querySelector(document, selector)
    if (!root) return console.error("Smart Table " + selector + " not found")
    const table = querySelector(root, "table")
    if (!table) return console.error("Smart Table init need a table")
    const thead = querySelector(table, "thead")
    if (!thead) return console.error("Smart Table init need a thead")
    const tbody = querySelector(table, "tbody")
    if (!tbody) return console.error("Smart Table init need a tbody")

    root.classList.add("smart-table")
    options.size && root.classList.add("stb-cust-" + options.size)
    options.align && root.classList.add("stb-cust-" + options.align)
    hasAttribute(table, "stripe") && tbody.classList.add("stripe")

    options.expand ? (querySelectorAll(thead, 'th[sort]').forEach(column => {
        removeAttribute(column, "sort")
      }), querySelectorAll(thead, 'th[fixed]').forEach(column => {
        removeAttribute(column, "fixed")
      })) : (querySelectorAll(tbody, 'tr[expand]').forEach(column => {
        removeAttribute(column, "expand")
      }), querySelectorAll(thead, 'tr[expand-parent]').forEach(column => {
        removeAttribute(column, "expand-parent")
      }))

      !!options.expandCallback && (querySelectorAll(thead, 'th[fixed]').forEach(column => {
        removeAttribute(column, "fixed")
      }))

    const vm = this;
    vm.$root = root
    vm.$thead = thead
    vm.$tbody = tbody
    vm.options = options
    vm.gutterWidth = scrollBarWidth()
    vm.style = {
      radioBgColor: options.radioBgColor || '#D1E7FF',
      hoverBgColor: options.hoverBgColor || '#EFF8FF'
    }
    vm.size = {}
    vm.hasCheckbox = !options.expand && options.selection === 'checkbox'
    vm.hasExpandCb = !!options.expandCallback

    vm.hasExpandCb && appendExpandTrigger(vm)

    vm.hasCheckbox && appendCheckbox(vm)

    //初始化thead 并获取props
    initProps(vm)
    layout(vm, table)

    if (!options.expand) {
      //初始化fixed元素及宽度
      initFixed(vm)
      createFixed(vm, thead, tbody)
    }

    //获取tbody的data数据
    initData(vm, tbody)
    options.expand && initExpand(vm, tbody)
    bindEvents(vm)

    const th = createElement("th");
    styled(th, {
      display: 'none'
    })
    setAttribute(th, "width", vm.gutterWidth);
    setAttribute(th, "rowspan", vm.props.shapes.length);
    appendChild(querySelector(vm.$thead, "tr"), th);
    vm.$scrollTH = th;
    if (vm.scrollY) {
      styled(vm.$scrollTH, {
        display: 'table-cell'
      })
      resize(vm)
    }
  }
}

function appendExpandTrigger(vm) {
  const {
    $thead,
    $tbody
  } = vm;
  let theadRow = querySelector($thead, "tr");
  let th = theadRow.querySelector("th");
  let cell = createExpandTrigger("th", getAttrNumber(th, "rowspan", 1));
  hasAttribute(th, "fixed") && setAttribute(cell, "fixed")
  insertBefore(theadRow, cell, th)
  querySelectorAll($tbody, "tr").forEach(row => {
    let td = row.querySelector("td")
    insertBefore(row, createExpandTrigger("td", getAttrNumber(td, "rowspan", 1)), td)
  })
}

function appendCheckbox(vm) {
  const {
    $thead,
    $tbody
  } = vm;
  let theadRow = querySelector($thead, "tr");
  let th = theadRow.querySelector("th");
  let cell = createCheckbox("th", getAttrNumber(th, "rowspan", 1));
  hasAttribute(th, "fixed") && setAttribute(cell, "fixed")
  insertBefore(theadRow, cell, th)
  querySelectorAll($tbody, "tr").forEach(row => {
    let td = row.querySelector("td")
    insertBefore(row, createCheckbox("td", getAttrNumber(td, "rowspan", 1)), td)
  })
}

function layout(vm, table) {
  const {
    $root,
    $thead,
    $tbody,
    options
  } = vm;
  const {
    height
  } = options;

  querySelectorAll($thead, "th").forEach(cell => refactorCell(cell))
  querySelectorAll($tbody, "td").forEach(cell => refactorCell(cell))

  //初始化colgroup数据数组
  initColgroupData(vm);

  //初始化table 拆分table的thead和tbody
  vm.$theadWrapper = createTableWrapper("stb_header-wrapper", vm, "header", $thead);
  vm.$tbodyWrapper = createTableWrapper("stb_body-wrapper", vm, "body", $tbody);
  appendChildren($root, [vm.$theadWrapper, vm.$tbodyWrapper]);

  const theadHeight = offsetHeight($thead);
  const custHeight = (typeof height === 'function' ? height.call() : height) || offsetHeight($root);
  const tbodyWrapperHeight = custHeight > theadHeight ? (custHeight - theadHeight - 1) : (theadHeight + 150)
  styled(vm.$tbodyWrapper, {
    height: tbodyWrapperHeight + "px"
  })


  vm.size.tbodyWrapperHeight = tbodyWrapperHeight;

  //垂直方向是否有滚动条
  vm.scrollY = offsetHeight(vm.$tbody) > tbodyWrapperHeight;
  //删除空余的table节点
  removeChild(table.parentNode, table);
}

//根据表格中的tbody第一行 查出每列的宽度并记录
function initColgroupData(vm) {
  const {
    $root,
    props
  } = vm;
  const rootWidth = offsetWidth($root) - 1;
  const clientWidth = rootWidth - (vm.scrollY ? vm.gutterWidth : 0);
  let arr = [];
  let totalWidth = 0;
  props.shapes.forEach(shape => {
    shape.forEach((column, cIndex) => {
      if (column) {
        let colspan = getAttrNumber(column, 'colspan', 1)
        if (colspan === 1) {
          arr[cIndex] = getAttrNumber(column, 'width', 0)
        }
      }
    })
  })
  let zeroLen = 0;
  arr.forEach(item => {
    totalWidth += item
    item === 0 && zeroLen++
  })
  if (zeroLen) {
    const per = Math.floor((clientWidth - totalWidth) / zeroLen)
    const min = per > 80 ? per : 80;
    let lastZeroIndex = 0;
    totalWidth = 0;
    arr = arr.map((item, index) => {
      if (item === 0) {
        if ((vm.hasCheckbox || vm.hasExpandCb) && index === 0) {
          item = 55;
        } else {
          item = min;
        }
        lastZeroIndex = index;
      }
      totalWidth += item
      return item
    })
    if (clientWidth > totalWidth) {
      arr[lastZeroIndex] = arr[lastZeroIndex] + clientWidth - totalWidth;
      totalWidth = clientWidth
    }
  } else {
    totalWidth = arr.reduce((item, sum) => sum + item, 0)
  }
  vm.colgroup = arr;
  vm.size.rootWidth = rootWidth
  vm.size.tableWidth = totalWidth
  vm.scrollX = vm.size.tableWidth > vm.size.rootWidth;
}

function bindResizeEvents(vm) {
  window.addEventListener("resize", () => resize(vm), {
    passive: true
  })
}

function bindEvents(vm) {
  bindScrollEvents(vm);
  bindRowEvents(vm);
  vm.options.expand ? bindExpandTreeEvents(vm) : bindSortEvents(vm);
  bindResizeEvents(vm);
}

function resize(vm) {
  debounce(500, () => {
    const {
      fixedLeft,
      fixedRight
    } = vm.props;
    initColgroupData(vm)
    replaceColGroup(vm)

    vm.scrollY = offsetHeight(vm.$tbody) > vm.size.tbodyWrapperHeight;
    styled(vm.$scrollTH, {
      display: vm.scrollY ? 'table-cell' : 'none'
    })

    let height = (offsetHeight(vm.$root) - (vm.scrollX ? vm.gutterWidth : 2));
    const tableHeight = offsetHeight(vm.$thead) + offsetHeight(vm.$tbody);
    height = tableHeight > height ? height : tableHeight

    const bodyWrapperHeight = vm.size.tbodyWrapperHeight - (vm.scrollX ? vm.gutterWidth : 0);
    const bodyWrapperTop = offsetHeight(vm.$thead);
    let fixedLeftWidth = 0;
    let fixedRightWidth = 0;
    if (vm.$fixedLeft && fixedLeft.thead.length) {
      fixedLeft.thead.forEach((item, index) => {
        fixedLeftWidth += vm.colgroup[index]
      })
      styled(vm.$fixedLeftBody, {
        height: bodyWrapperHeight + "px",
        top: bodyWrapperTop + "px"
      })
      styled(vm.$fixedLeft, {
        width: fixedLeftWidth + "px",
        height: height + "px"
      })
    }
    if (vm.$fixedRight && fixedRight.thead.length) {
      fixedRight.thead.forEach((item, index) => {
        fixedRightWidth += vm.colgroup[vm.colgroup.length - index - 1]
      })
      styled(vm.$fixedRightBody, {
        height: bodyWrapperHeight + "px",
        top: bodyWrapperTop + "px"
      })
      styled(vm.$fixedRight, {
        width: fixedRightWidth + "px",
        height: height + "px",
        right: (vm.scrollY ? vm.gutterWidth : 0) + "px"
      })
      styled(vm.$rightPatch, {
        display: vm.scrollY ? 'block' : 'none',
        height: offsetHeight(vm.$thead) + "px"
      })
    }
  })()
}

function syncPostion(vm) {
  throttle(20, () => {
    vm.$theadWrapper.scrollLeft = vm.$tbodyWrapper.scrollLeft;
    if (vm.$fixedLeftBody) {
      vm.$fixedLeftBody.scrollTop = vm.$tbodyWrapper.scrollTop;
    }
    if (vm.$fixedRightBody) {
      vm.$fixedRightBody.scrollTop = vm.$tbodyWrapper.scrollTop;
    }
  })()
}

function bindExpandTreeEvents(vm) {
  function seek(arr) {
    arr.forEach(item => {
      if (item.expand) {
        if (item.children && item.children.length > 0) {
          querySelector(item.$el, "td").addEventListener('click', () => {
            expanding(item, !hasAttribute(item.$el, "expanded"))
          })
          seek(item.children)
        } else {
          item.expand = false;
          removeAttribute(item.$el, "expand")
        }
      }
    })

    function expanding(item, expanded) {
      expanded ? setAttribute(item.$el, "expanded") : removeAttribute(item.$el, "expanded");
      item.children && (item.children.forEach(child => {
        styled(child.$el, {
          display: expanded ? '' : 'none'
        })
        expanding(child, expanded)
      }))
    }
  }
  seek(vm.expandData)
}

function bindScrollEvents(vm) {
  vm.$tbodyWrapper.addEventListener("scroll", () => syncPostion(vm), {
    passive: true
  })
}

function bindRowEvents(vm) {
  let {
    selection,
    selectionKey
  } = vm.options;
  selectionKey = selectionKey || 0;
  vm.hasExpandCb && (selectionKey++)
  const totalCheckbox = querySelector(vm.$fixedLeft || vm.$thead, "th>.stb_cell>label.std-checkbox");
  [].concat(vm.data, vm.unsortData).forEach(row => {
    addHoverEvent(vm, row.$el, [row.$fixedLeftEl, row.$fixedRightEl])
    row.$fixedLeftEl && addHoverEvent(vm, row.$fixedLeftEl, [row.$el, row.$fixedRightEl])
    row.$fixedRightEl && addHoverEvent(vm, row.$fixedRightEl, [row.$el, row.$fixedLeftEl])
    const value = row['field-' + selectionKey]
    if (selection) {
      switch (selection) {
        case 'radio':
          addRadioEvent(vm, row.$el, [row.$fixedLeftEl, row.$fixedRightEl], value)
          row.$fixedLeftEl && addRadioEvent(vm, row.$fixedLeftEl, [row.$el, row.$fixedRightEl], value)
          row.$fixedRightEl && addRadioEvent(vm, row.$fixedRightEl, [row.$el, row.$fixedLeftEl], value)
          break
        case 'checkbox':
          addCheckboxEvent(vm, row.$fixedLeftEl || row.$el, totalCheckbox, value)
          break
      }
    }
    vm.hasExpandCb && addExpandTriggerEvent(vm, row.$fixedLeftEl || row.$el, row.$key, value)
  })
  if (vm.hasCheckbox) {
    addTotalCheckboxEvent(vm, totalCheckbox)
  }
}

function addExpandTriggerEvent(vm, row, key, value) {
  const {
    options
  } = vm;
  const trigger = querySelector(row, ".expand-cell>.stb_cell")
  if (!trigger) return;
  trigger.addEventListener('click', ($event) => {
    if (trigger.hasAttribute("loading")) return;
    if (trigger.hasAttribute("open")) {
      removeAttribute(trigger, "open")
      querySelectorAll(vm.$root, "tr.expand-" + key).forEach(expandRow => {
        removeChild(expandRow.parentNode, expandRow)
      })
    } else {
      setAttribute(trigger, "loading", true)
      options.expandCallback.call(this, {
        open: function (content, needParse) {
          let cell = createElement("td")
          setAttribute(cell, "colspan", vm.colgroup.length)
          let wrapper = createElement("div", "std-dialog_content")
          needParse ? (wrapper.innerHTML = content) : (appendChild(wrapper, content))
          appendChild(cell, wrapper)
          let expandRow = createElement("tr", `std-expand-row expand-${key}`)
          appendChild(expandRow, cell)
          insertBefore(row.parentNode, expandRow, row.nextSibling)
          setAttribute(trigger, "open")
          removeAttribute(trigger, "loading")
        }
      }, value)
    }
    $event.stopPropagation();
  })
}


function addCheckboxEvent(vm, row, totalCheckbox, value) {
  const trigger = querySelector(row, "label.std-checkbox")
  if (!trigger || !totalCheckbox) return;
  trigger.addEventListener('click', () => {
    let {
      selected
    } = vm;
    selected = selected || [];
    const target = !hasAttribute(trigger, "checked");
    target ? setAttribute(trigger, 'checked', true) : removeAttribute(trigger, 'checked')
    target ? selected.push(value) : selected.splice(selected.indexOf(value), 1)
    const len = selected.length;
    len ? setAttribute(vm.$root, 'selected', JSON.stringify(selected)) : removeAttribute(vm.$root, 'selected');
    if (len === (vm.data.length + vm.unsortData.length)) {
      setAttribute(totalCheckbox, 'checked', true)
    } else {
      removeAttribute(totalCheckbox, 'checked')
    }
    vm.selected = selected;
  })
}

function addTotalCheckboxEvent(vm, totalCheckbox) {
  if (!totalCheckbox) return;
  const {
    selectionKey
  } = vm.options;
  totalCheckbox.addEventListener('click', () => {
    let {
      selected
    } = vm;
    selected = [];
    const target = !hasAttribute(totalCheckbox, "checked");
    target ? setAttribute(totalCheckbox, 'checked', true) : removeAttribute(totalCheckbox, 'checked');
    [].concat(vm.data, vm.unsortData).forEach(row => {
      let trigger = querySelector(row.$fixedLeftEl || row.$el, "label.std-checkbox")
      target ? setAttribute(trigger, 'checked', true) : removeAttribute(trigger, 'checked')
      target && selected.push(row['field-' + (selectionKey || 0)])
    })
    const len = selected.length;
    len ? setAttribute(vm.$root, 'selected', JSON.stringify(selected)) : removeAttribute(vm.$root, 'selected');
    vm.selected = selected;
  })
}

function addRadioEvent(vm, trigger, relates, radioValue) {
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    let {
      selected
    } = vm;
    let target = false;
    if (selected === radioValue && !hasAttribute(trigger, "checked")) return;
    if (selected !== radioValue) {
      querySelectorAll(vm.$root, 'tr[checked]>td').forEach(item => styled(item, {
        background: ''
      }))
      querySelectorAll(vm.$root, 'tr[checked]').forEach(item => removeAttribute(item, "checked"))
      target = true;
    } else {
      if (hasAttribute(trigger, "checked")) {
        target = false;
      }
    }
    selected = target ? radioValue : null;
    target ? setAttribute(trigger, "checked", true) : removeAttribute(trigger, "checked");
    trigger.querySelectorAll("td").forEach(column => {
      styled(column, {
        background: target ? vm.style.radioBgColor : ''
      })
    })
    relates.forEach(item => {
      if (item) {
        target ? setAttribute(item, "checked", true) : removeAttribute(item, "checked")
        item.querySelectorAll("td").forEach(column => {
          styled(column, {
            background: target ? vm.style.radioBgColor : ''
          })
        })
      }
    })
    target ? setAttribute(vm.$root, 'selected', JSON.stringify(selected)) : removeAttribute(vm.$root, 'selected');
    vm.selected = selected;
  })
}

function addHoverEvent(vm, trigger, relates) {
  if (!trigger) return;
  trigger.addEventListener('mouseenter', () => {
    styled(trigger, {
      background: vm.style.hoverBgColor
    })
    relates.forEach(el => {
      el && styled(el, {
        background: vm.style.hoverBgColor
      })
    })
  })
  trigger.addEventListener('mouseleave', () => {
    styled(trigger, {
      background: ''
    })
    relates.forEach(el => {
      el && styled(el, {
        background: ''
      })
    })
  })
}

function bindSortEvents(vm) {
  let els = Array.from(querySelectorAll(vm.$root, "th[sort]"));
  if (els.length === 0) return;
  els.forEach(el => {
    el.addEventListener("click", $event => {
      $event.stopPropagation();
      let sortType = "ASC";
      let sortOrder = getAttribute(el, "sort") || "string";
      if (el.classList.contains("asc")) {
        el.classList.remove("asc");
        el.classList.add("desc");
        sortType = "DESC"
      } else {
        el.classList.remove("desc");
        el.classList.add("asc");
      }
      els = els.map(item => {
        if (el != item) {
          item.classList.remove("asc", "desc")
        }
        return item
      })
      querySelectorAll(vm.$root, "tr.std-expand-row").forEach(row => {
        removeChild(row.parentNode, row)
      })
      querySelectorAll(vm.$root, ".expand-cell>.stb_cell[open]").forEach(el => {
        removeAttribute(el, "open")
      })
      querySelectorAll(vm.$root, ".expand-cell>.stb_cell[loading]").forEach(el => {
        removeAttribute(el, "loading")
      })
      sort(vm, getAttribute(el, "sortkey"), sortType, sortOrder)
    })
  })
}

function initProps(vm) {
  let props = {};
  //创建表头单元格二维数组
  let shapes = [];
  let rows = querySelectorAll(vm.$thead, "tr");
  rows.forEach((row, index) => {
    let shape = shapes[index] || [];
    let columns = querySelectorAll(row, "th");
    columns.forEach((column) => {
      let rowspan = getAttrNumber(column, "rowspan", 1);
      let colspan = getAttrNumber(column, "colspan", 1);
      let insertIndex = getEmptyIndexInArray(shape) || shape.length;
      shape[insertIndex] = column;

      if (hasAttribute(column, "sort")) {
        setAttribute(column, "sortkey", "field-" + insertIndex);
      }
      if (colspan > 1) {
        for (let i = 1; i < colspan; i++) {
          shape[insertIndex + i] = 0;
        }
      }

      if (rowspan > 1) {
        for (let i = 1; i < rowspan; i++) {
          let next = shapes[index + i] || [];
          for (let j = 0; j < colspan; j++) {
            next[insertIndex + j] = 0;
          }
          shapes[index + i] = next;
        }
      }

      shapes[index] = shape;
    })
  })
  props.shapes = shapes;
  vm.props = props;
}

function initFixed(vm) {
  let {
    colgroup,
    props
  } = vm;
  const colgroupLen = colgroup.length;
  let fixedLeft = {
    thead: [],
    tbody: [],
    width: 0
  };
  let fixedRight = {
    thead: [],
    tbody: [],
    width: 0
  };
  const columns = querySelectorAll(vm.$thead, "tr:first-child>th");
  const len = columns.length;
  let lastLeftIndex = 0;
  if (len !== 0) {
    if (hasAttribute(columns[0], "fixed")) {
      //判断左边固定项  不判断最后一项做为左固定项目
      for (let i = 0; i < len - 1; i++) {
        if (hasAttribute(columns[i], "fixed")) {
          lastLeftIndex = i;
          fixedLeft.thead.push("field-" + i);
          let colspan = getAttrNumber(columns[i], "colspan", 1);
          for (let j = 0; j < colspan; j++) {
            fixedLeft.tbody.push("field-" + (i + j));
            fixedLeft.width += colgroup[i + j];
          }
        } else {
          break;
        }
      }
    }
    if (hasAttribute(columns[len - 1], "fixed")) {
      //判断右边边固定项 不判断第一项做为右边固定项目
      let rightCnt = 0;
      for (let i = len - 1; i > 0; i--) {
        if (hasAttribute(columns[i], "fixed")) {
          //左右固定项目重叠时 跳出
          if (i === lastLeftIndex) {
            break;
          }
          fixedRight.thead.push("field-" + i);
          let colspan = getAttrNumber(columns[i], "colspan", 1);
          for (let j = 0; j < colspan; j++) {
            rightCnt++;
            fixedRight.tbody.push("field-" + (colgroupLen - rightCnt))
            fixedRight.width += colgroup[colgroupLen - rightCnt];
          }
        } else {
          break;
        }
      }
    }
  }
  props.fixedLeft = fixedLeft;
  props.fixedRight = fixedRight;
}

function initExpand(vm, tbody) {
  const expandAll = vm.options.defaultExpandAll;
  let data = [];
  let parents = [];
  let parentIds = [];
  querySelectorAll(tbody, "tr").forEach(row => {
    let paddingLength = parents.length;
    let expand = hasAttribute(row, "expand");
    let hasParent = hasAttribute(row, "expand-parent");
    let expandParentId = getAttribute(row, "expand-parent");
    if (parentIds.indexOf(expandParentId) === -1) {
      hasParent = false;
    }
    let node = {
      $el: row,
      id: getAttribute(row, "expand"),
      expand: expand
    };
    if (expand) {
      expandAll ? setAttribute(row, 'expanded') : removeAttribute(row, 'expanded');
    }

    if (expand && !hasParent) {
      node.children = [];
      parents = [node];
      parentIds.push(node.id)
      data.push(node);
    } else if (hasParent) {
      let parentId = getAttribute(row, "expand-parent");
      let arr = [];
      for (let i = 0; i < parents.length; i++) {
        arr.push(parents[i])
        if (parents[i].id === parentId) {
          break
        }
      }
      parents = arr;
      paddingLength = parents.length;
      let parent = parents[parents.length - 1];
      parent && parent.children.push(node);
      if (expand) {
        parents.push(node)
        parentIds.push(node.id)
        node.children = [];
      }
    } else {
      data.push(node)
    }
    if (hasParent) {
      styled(querySelector(row, "td"), {
        paddingLeft: 32 * paddingLength + "px"
      })
      styled(row, {
        display: expandAll ? '' : 'none'
      })
    }
  })
  vm.expandData = data;
  styled(vm.$tbodyWrapper, {
    height: ''
  })
  styled(vm.$tbodyWrapper, {
    maxHeight: vm.size.tbodyWrapperHeight + 'px'
  })
}

function initData(vm, tbody) {
  let fixedLeftRows = vm.$fixedLeftBody && querySelectorAll(vm.$fixedLeftBody, "tbody tr");
  let fixedRightRows = vm.$fixedRightBody && querySelectorAll(vm.$fixedRightBody, "tbody tr");
  let data = [];
  let unsortData = [];
  querySelectorAll(tbody, "tr").forEach((row, index) => {
    let rowData = {
      $el: row,
      $fixedLeftEl: fixedLeftRows && fixedLeftRows[index],
      $fixedRightEl: fixedRightRows && fixedRightRows[index],
      $key: 'rowkey' + index
    };
    querySelectorAll(row, "td .stb_cell").forEach((cell, index) => {
      rowData["field-" + index] = cell.innerHTML;
    })
    if (!hasAttribute(row, "unsort")) {
      data.push(rowData)
    } else {
      unsortData.push(rowData)
    }
  })
  vm.data = data;
  vm.unsortData = unsortData;
}