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

    //初始化thead 并获取props
    vm.props = initProps(thead);

    layout(vm, table)

    // createFixed(vm, thead, tbody);

    //获取tbody的data数据
    vm.data = initData(vm, tbody);

    bindEvents(vm);

    if (vm.scrollY) {
      let th = createElement("th");
      th.setAttribute("width", vm.gutterWidth);
      th.setAttribute("rowspan", vm.props.shapes.length);
      appendChild(querySelector(thead, "tr"), th);
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

  vm.size.rootHeight = theadHeight + tbodyWrapperHeight;
  vm.size.theadHeight = theadHeight;
  vm.size.tbodyHeight = $tbody.offsetHeight;
  vm.size.tbodyWrapperHeight = tbodyWrapperHeight;

  //垂直方向是否有滚动条
  vm.scrollY = vm.size.tbodyHeight > tbodyWrapperHeight;
  //水平方向是否有滚动条
  vm.scrollX = vm.size.tableWidth > vm.size.rootWidth;
  //初始化fixed元素及宽度
  initFixed(vm.$thead, vm);
  //删除空余的table节点
  removeChild(table.parentNode, table);
  console.log(vm.size)
}

//根据表格中的tbody第一行 查出每列的宽度并记录
function initColgroupData(vm) {
  const { $root, props } = vm;
  let offsetWidth = $root.offsetWidth - 1;
  let clientWidth = offsetWidth - (vm.scrollY ? vm.gutterWidth : 0);
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
    let diff = clientWidth - totalWidth
    let per = Math.floor(diff / zeroLen)
    let min = per > 80 ? per : 80;
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
  vm.size = {
    rootWidth: offsetWidth,
    tableWidth: totalWidth
  }
}

function bindResizeEvents(vm) {
  window.addEventListener("resize", debounce(500, () => {
    initColgroupData(vm)
    console.log(vm.$root.offsetWidth)
  }))
}


function bindEvents(vm) {
  bindScrollEvents(vm)
  bindHoverEvents(vm)
  bindSortEvents(vm);
  bindResizeEvents(vm)
}

function replaceFixedColGroup(vm, selector, newTableWidth) {
  if (selector) {
    let fixedHeader = querySelector(selector, '.stb_header');
    let fixedBody = querySelector(selector, '.stb_body');
    replaceColGroup(vm, fixedHeader);
    replaceColGroup(vm, fixedBody);
    const columns = querySelectorAll(selector, "tr:first-child>th");
    let fixedWrapperWidth = 0;
    columns.forEach((item, index) => {
      if (item.className != 'is-hidden') fixedWrapperWidth += vm.colgroup[index]
    })
    selector.style.width = fixedWrapperWidth + 'px';
    fixedHeader.style.width = newTableWidth + 'px';
    fixedBody.style.width = newTableWidth + 'px';
  }
}

function syncPostion(vm) {
  throttle(20, () => {
    vm.$theadWrapper.scrollLeft = vm.$tbodyWrapper.scrollLeft;
    if (vm.$fixedLeft) {
      vm.$fixedLeft.scrollTop = vm.$tbodyWrapper.scrollTop;
    }
    if (vm.$fixedRight) {
      vm.$fixedRight.scrollTop = vm.$tbodyWrapper.scrollTop;
    }
  })()
}

function bindScrollEvents(vm) {
  vm.$tbodyWrapper.addEventListener("scroll", () => syncPostion(vm), {
    passive: true
  })
}

function bindHoverEvents(vm) {
  let trs = querySelectorAll(vm.$tbodyWrapper, 'tr');
  let fixedLeftTrs = querySelectorAll(vm.$root, '.stb_fixed .stb_fixed-body-wrapper tr');
  let fixedRightTrs = querySelectorAll(vm.$root, '.stb_fixed-right .stb_fixed-body-wrapper tr');
  trs.forEach((tr, trIndex) => {
    tr.addEventListener('mouseenter', () => {
      tr.style.background = vm.style.hoverBgColor;
      if (fixedLeftTrs.length > 0) fixedLeftTrs[trIndex].style.background = vm.style.hoverBgColor;
      if (fixedRightTrs.length > 0) fixedRightTrs[trIndex].style.background = vm.style.hoverBgColor;
    })
    tr.addEventListener('mouseleave', () => {
      tr.style.background = ''
      if (fixedLeftTrs.length > 0) fixedLeftTrs[trIndex].style.background = '';
      if (fixedRightTrs.length > 0) fixedRightTrs[trIndex].style.background = '';
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

function bindResizeEvents2(vm) {
  window.addEventListener("resize", debounce(600, () => {
    let table = vm.$root;
    let oldWrapperWidth = vm.size.wrapperWidth;
    let oldTableWidth = vm.size.tableWidth;
    let newWrapperWidth = table.offsetWidth;
    let newTableWidth = parseInt(oldTableWidth * (newWrapperWidth / oldWrapperWidth));
    let headerWrapper = querySelector(vm.$theadWrapper, '.stb_header');
    let bodyWrapper = querySelector(vm.$tbodyWrapper, '.stb_body');
    vm.colgroup.forEach(function(item, index) {
      vm.colgroup[index] = parseInt(newTableWidth * (item / oldTableWidth)) + 1
    })
    vm.size.wrapperWidth = newWrapperWidth;
    vm.size.tableWidth = newTableWidth;
    headerWrapper.style.width = newTableWidth + 'px';
    bodyWrapper.style.width = newTableWidth + 'px';
    // 替换colgroup
    replaceColGroup(vm, headerWrapper);
    replaceColGroup(vm, bodyWrapper);
    replaceFixedColGroup(vm, querySelector(table, '.stb_fixed'), newTableWidth);
    replaceFixedColGroup(vm, querySelector(table, '.stb_fixed-right'), newTableWidth);
  }))
}

function initProps(thead) {
  let props = {};
  //创建表头单元格二维数组
  let shapes = [];
  let rows = querySelectorAll(thead, "tr");
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
  return props;
}

function initFixed(thead, vm) {
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
  const columns = querySelectorAll(thead, "tr:first-child>th");
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
            fixedLeft.width = fixedLeft.width + colgroup[i + j];
          }
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
            fixedRight.width = fixedRight.width + colgroup[colgroupLen - rightCnt];
          }
        }
      }
    }
  }
  props.fixedLeft = fixedLeft;
  props.fixedRight = fixedRight;
}

function initData(vm, tbody) {
  let fixedLeftRows = vm.$fixedLeft && querySelectorAll(vm.$fixedLeft, "tbody tr");
  let fixedRightRows = vm.$fixedRight && querySelectorAll(vm.$fixedRight, "tbody tr");
  let data = [];
  querySelectorAll(tbody, "tr").forEach((row, index) => {
    if (!row.hasAttribute("unsort")) {
      let rowData = {
        $el: row,
        $fixedLeftEl: fixedLeftRows && fixedLeftRows[index],
        $fixedRightEl: fixedRightRows && fixedRightRows[index],
        $key: '$$rowkey' + index
      };
      querySelectorAll(row, "td .stb_cell").forEach((cell, index) => {
        rowData["field-" + index] = cell.innerHTML;
      })
      data.push(rowData)
    }
  })
  return data;
}