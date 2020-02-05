import sort from './vdom';
import {
  appendChild,
  appendChildren,
  removeChild,
  createElement,
  querySelector,
  querySelectorAll
} from './node-ops';
import createFixed from './fixed';
import {
  throttle,
  debounce,
  getIntByAttr,
  refactorCell,
  replaceColGroup,
  createTableWrapper,
  getEmptyIndexInArray
} from './utils';
import scrollBarWidth from './scrollbar-width';

export default function initMixin(Table) {
  Table.prototype._init = function(options = {}) {
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
    table.hasAttribute("stripe") && tbody.classList.add("stripe")

    const vm = this;
    vm.$root = root
    vm.$thead = thead
    vm.$tbody = tbody
    vm.options = options
    vm.gutterWidth = scrollBarWidth()
    vm.style = {
      hoverBgColor: options.hoverBgColor || '#EFF8FF'
    }
    vm.size = {}

    //初始化thead 并获取props
    initProps(vm)
    layout(vm, table)

    //初始化fixed元素及宽度
    initFixed(vm)
    createFixed(vm, thead, tbody)

    //获取tbody的data数据
    initData(vm, tbody)
    bindEvents(vm)

    const th = createElement("th");
    th.style.display = 'none'
    th.setAttribute("width", vm.gutterWidth);
    th.setAttribute("rowspan", vm.props.shapes.length);
    appendChild(querySelector(vm.$thead, "tr"), th);
    vm.$scrollTH = th;
    if (vm.scrollY) {
      vm.$scrollTH.style.display = 'table-cell'
      resize(vm)
    }
  }
}

function layout(vm, table) {
  const { $root, $thead, $tbody, options } = vm;
  const { height } = options;
  querySelectorAll($thead, "th").forEach(cell => refactorCell(cell))
  querySelectorAll($tbody, "td").forEach(cell => refactorCell(cell))

  //初始化colgroup数据数组
  initColgroupData(vm);

  //初始化table 拆分table的thead和tbody
  vm.$theadWrapper = createTableWrapper("stb_header-wrapper", vm, "header", $thead);
  vm.$tbodyWrapper = createTableWrapper("stb_body-wrapper", vm, "body", $tbody);
  appendChildren($root, [vm.$theadWrapper, vm.$tbodyWrapper]);

  const theadHeight = $thead.offsetHeight;
  const offsetHeight = (typeof height === 'function' ? height.call() : height) || $root.offsetHeight;
  const tbodyWrapperHeight = offsetHeight > theadHeight ? (offsetHeight - theadHeight - 1) : (theadHeight + 150)
  vm.$tbodyWrapper.style.height = tbodyWrapperHeight + "px";

  vm.size.tbodyWrapperHeight = tbodyWrapperHeight;

  //垂直方向是否有滚动条
  vm.scrollY = vm.$tbody.offsetHeight > tbodyWrapperHeight;
  //删除空余的table节点
  removeChild(table.parentNode, table);
}

//根据表格中的tbody第一行 查出每列的宽度并记录
function initColgroupData(vm) {
  const { $root, props } = vm;
  const offsetWidth = $root.offsetWidth - 1;
  const clientWidth = offsetWidth - (vm.scrollY ? vm.gutterWidth : 0);
  let arr = [];
  let totalWidth = 0;
  props.shapes.forEach(shape => {
    shape.forEach((column, cIndex) => {
      if (column) {
        let colspan = getIntByAttr(column, 'colspan', 1)
        if (colspan === 1) {
          arr[cIndex] = getIntByAttr(column, 'width', 0)
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
        item = min;
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
  vm.size.rootWidth = offsetWidth
  vm.size.tableWidth = totalWidth
  vm.scrollX = vm.size.tableWidth > vm.size.rootWidth;
}

function bindResizeEvents(vm) {
  window.addEventListener("resize", () => resize(vm), {
    passive: true
  })
}

function bindEvents(vm) {
  bindScrollEvents(vm)
  bindHoverEvents(vm)
  bindSortEvents(vm);
  bindResizeEvents(vm)
}

function resize(vm) {
  debounce(500, () => {
    const { fixedLeft, fixedRight } = vm.props;
    initColgroupData(vm)
    replaceColGroup(vm)

    vm.scrollY = vm.$tbody.offsetHeight > vm.size.tbodyWrapperHeight;
    vm.$scrollTH.style.display = vm.scrollY ? 'table-cell' : 'none';

    let height = (vm.$root.offsetHeight - (vm.scrollX ? vm.gutterWidth : 2));
    const tableHeight = vm.$thead.offsetHeight + vm.$tbody.offsetHeight;
    height = tableHeight > height ? height : tableHeight

    const bodyWrapperHeight = vm.size.tbodyWrapperHeight - (vm.scrollX ? vm.gutterWidth : 0);
    const bodyWrapperTop = vm.$thead.offsetHeight;
    let fixedLeftWidth = 0;
    let fixedRightWidth = 0;
    if (vm.$fixedLeft && fixedLeft.thead.length) {
      fixedLeft.thead.forEach((item, index) => {
        fixedLeftWidth += vm.colgroup[index]
      })
      vm.$fixedLeftBody.style.height = bodyWrapperHeight + "px";
      vm.$fixedLeftBody.style.top = bodyWrapperTop + "px";
      vm.$fixedLeft.style.width = fixedLeftWidth + "px";
      vm.$fixedLeft.style.height = height + "px";
    }
    if (vm.$fixedRight && fixedRight.thead.length) {
      fixedRight.thead.forEach((item, index) => {
        fixedRightWidth += vm.colgroup[vm.colgroup.length - index - 1]
      })
      vm.$fixedRightBody.style.height = bodyWrapperHeight + "px";
      vm.$fixedRightBody.style.top = bodyWrapperTop + "px";
      vm.$fixedRight.style.width = fixedRightWidth + "px"
      vm.$fixedRight.style.height = height + "px";
      vm.$fixedRight.style.right = (vm.scrollY ? vm.gutterWidth : 0) + "px";
      vm.$rightPatch.style.display = vm.scrollY ? 'block' : 'none';
      vm.$rightPatch.style.height = vm.$thead.offsetHeight;
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

function bindScrollEvents(vm) {
  vm.$tbodyWrapper.addEventListener("scroll", () => syncPostion(vm), {
    passive: true
  })
}

function bindHoverEvents(vm) {
  let data = [].concat(vm.data, vm.unsortData)
  data.forEach(row => {
    addHoverEventByEl(vm, row.$el, [row.$fixedLeftEl, row.$fixedRightEl])
    row.$fixedLeftEl && addHoverEventByEl(vm, row.$fixedLeftEl, [row.$el, row.$fixedRightEl])
    row.$fixedRightEl && addHoverEventByEl(vm, row.$fixedRightEl, [row.$el, row.$fixedLeftEl])

  })
}

function addHoverEventByEl(vm, trigger, relates) {
  if (!trigger) return;
  trigger.addEventListener('mouseenter', () => {
    trigger.style.background = vm.style.hoverBgColor
    relates.forEach(el => {
      el && (el.style.background = vm.style.hoverBgColor)
    })
  })
  trigger.addEventListener('mouseleave', () => {
    trigger.style.background = ''
    relates.forEach(el => {
      el && (el.style.background = '')
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
      let sortOrder = el.getAttribute("sort") || "string";
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
      sort(vm, el.getAttribute("sortkey"), sortType, sortOrder)
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
      let rowspan = getIntByAttr(column, "rowspan", 1);
      let colspan = getIntByAttr(column, "colspan", 1);
      let insertIndex = getEmptyIndexInArray(shape) || shape.length;
      shape[insertIndex] = column;

      if (column.hasAttribute("sort")) {
        column.setAttribute("sortkey", "field-" + insertIndex);
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
    if (columns[0].hasAttribute("fixed")) {
      //判断左边固定项  不判断最后一项做为左固定项目
      for (let i = 0; i < len - 1; i++) {
        if (columns[i].hasAttribute("fixed")) {
          lastLeftIndex = i;
          fixedLeft.thead.push("field-" + i);
          let colspan = getIntByAttr(columns[i], "colspan", 1);
          for (let j = 0; j < colspan; j++) {
            fixedLeft.tbody.push("field-" + (i + j));
            fixedLeft.width += colgroup[i + j];
          }
        } else {
          break;
        }
      }
    }
    if (columns[len - 1].hasAttribute("fixed")) {
      //判断右边边固定项 不判断第一项做为右边固定项目
      let rightCnt = 0;
      for (let i = len - 1; i > 0; i--) {
        if (columns[i].hasAttribute("fixed")) {
          //左右固定项目重叠时 跳出
          if (i === lastLeftIndex) {
            break;
          }
          fixedRight.thead.push("field-" + i);
          let colspan = getIntByAttr(columns[i], "colspan", 1);
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
      $key: '$$rowkey' + index
    };
    querySelectorAll(row, "td .stb_cell").forEach((cell, index) => {
      rowData["field-" + index] = cell.innerHTML;
    })
    if (!row.hasAttribute("unsort")) {
      data.push(rowData)
    } else {
      unsortData.push(rowData)
    }
  })
  vm.data = data;
  vm.unsortData = unsortData;
}