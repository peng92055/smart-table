import {
  sort
} from './vdom';
import {
  cloneNode,
  appendChild,
  appendChildren,
  removeChild,
  createElement,
  querySelector,
  querySelectorAll
} from './node-ops';
import {
  throttle,
  debounce,
  getIntByAttr,
  refactorCell,
  replaceColGroup,
  createTabelWrapper,
  getEmptyIndexInArray
} from './utils';
import scrollBarWidth from './scrollbar-width';

export default function initMixin(Table) {
  Table.prototype._init = function(options = {}) {
    if (!options.selector) {
      console.error("Smart Table init need a selector")
    }
    const vm = this;
    vm.$options = options;
    const root = options.selector && querySelector(document, String(options.selector).trim());
    if (!root) return;
    const table = querySelector(root, "table");
    if (!table) return;

    vm.gutterWidth = scrollBarWidth();

    root.classList.add("smart-table");

    options.size && root.classList.add("smart-table-custom-" + options.size)
    options.align && root.classList.add("smart-table-custom-" + options.align)

    const thead = querySelector(table, "thead")
    const tbody = querySelector(table, "tbody")

    querySelectorAll(thead, "th").forEach(cell => refactorCell(cell))
    querySelectorAll(tbody, "td").forEach(cell => refactorCell(cell))

    table.hasAttribute("stripe") && tbody.classList.add("stripe")

    table.style.width = "100%"

    vm.$root = root

    const theadHeight = thead.offsetHeight;
    const tableHeight = table.offsetHeight;
    let customHeight = options.height;
    customHeight = (typeof customHeight === 'function' ? customHeight() : customHeight) || tableHeight;
    customHeight = customHeight > theadHeight ? customHeight : (theadHeight + 100);
    //获取table宽高
    vm.size = {
      theadHeight: theadHeight,
      tbodyHeight: customHeight - theadHeight,
      tabelWidth: table.offsetWidth,
      wrapperWidth: table.offsetWidth,
      tableHeight: customHeight,
      fixWrapperHeigth: tableHeight > customHeight ? customHeight : tableHeight
    }

    //初始化thead 并获取props
    vm.props = initProps(thead);

    //获取colgroup数据数组
    vm.colgroup = getColgroup(thead, tbody, vm.props.theadLength);
    //根据头部列的二维数组 获取最小表格宽度
    vm.size.tabelWidth = table.style.width = vm.colgroup.reduce((total, num) => total + num);
    //垂直方向是否有滚动条
    vm.scrollY = customHeight < table.offsetHeight;
    //水平方向是否有滚动条
    vm.scrollX = root.offsetWidth < vm.size.tabelWidth;
    //初始化fixed元素及宽度
    initFixed(thead, vm);
    //初始化table 拆分table的thead和tbody
    vm.$theadWrapper = createTabelWrapper("smart-table_header-wrapper", vm, "header", thead);
    vm.$tbodyWrapper = createTabelWrapper("smart-table_body-wrapper", vm, "body", tbody);

    appendChildren(root, [vm.$theadWrapper, vm.$tbodyWrapper])

    vm.size.theadHeight = thead.offsetHeight;
    vm.size.tbodyHeight = customHeight - thead.offsetHeight;
    //删除空余的table节点
    removeChild(table.parentNode, table);

    rollupFixed(vm, thead, tbody)

    //获取tbody的data数据
    vm.data = initData(vm, tbody);

    initSortEvent(vm);
    bindEvents(vm);

    if (vm.scrollY) {
      let th = createElement("th");
      th.setAttribute("width", vm.gutterWidth);
      th.setAttribute("rowspan", vm.props.shapes.length);
      appendChild(querySelector(thead, "tr"), th);
    }
  }
}

function rollupFixed(vm, theadModel, tbodyModel) {
  const {
    fixedLeft,
    fixedRight
  } = vm.props;
  let rootMinWidth = 320;
  querySelectorAll(vm.$root, ".smart-table_body-wrapper").forEach(wrapper => {
      wrapper.style.height = vm.size.tbodyHeight + "px";
    })
    //左边有固定列
  if (fixedLeft.thead.length > 0) {
    rootMinWidth = rootMinWidth > fixedLeft.width ? rootMinWidth : fixedLeft.width;
    //构建header
    let thead = cloneNode(theadModel, true);
    querySelectorAll(querySelector(thead, "tr"), "th").forEach((column, index) => {
      if (fixedLeft.thead.indexOf("field-" + index) === -1) {
        column.classList.add('is-hidden')
      }
    })
    let headerWrapper = createTabelWrapper("smart-table_fixed-header-wrapper", vm, "header", thead);
    //构建body
    let tbody = cloneNode(tbodyModel, true);
    let rows = querySelectorAll(tbody, "tr");
    rows.forEach(row => {
      querySelectorAll(row, "td").forEach((column, index) => {
        if (fixedLeft.tbody.indexOf("field-" + index) === -1) {
          column.classList.add('is-hidden')
        }
      })
    })
    let bodyWrapper = createTabelWrapper("smart-table_fixed-body-wrapper", vm, "body", tbody);
    bodyWrapper.style.top = vm.size.theadHeight + "px";
    bodyWrapper.style.height = (vm.size.tbodyHeight - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
    let fixedContainer = createElement("div", "smart-table_fixed");
    appendChildren(fixedContainer, [headerWrapper, bodyWrapper]);
    fixedContainer.style.width = fixedLeft.width + "px";
    fixedContainer.style.height = (vm.size.fixWrapperHeigth - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
    appendChild(vm.$root, fixedContainer);
    vm.$fixedLeft = bodyWrapper;
  }
  //右边有固定列
  if (fixedRight.thead.length > 0) {
    rootMinWidth = rootMinWidth + fixedRight.width;
    //构建header
    let thead = cloneNode(theadModel, true);
    querySelectorAll(querySelector(thead, "tr"), "th").forEach((column, index) => {
      if (fixedRight.thead.indexOf("field-" + index) === -1) {
        column.classList.add('is-hidden')
      }
    })
    let headerWrapper = createTabelWrapper("smart-table_fixed-header-wrapper", vm, "header", thead);
    //构建body
    let tbody = cloneNode(tbodyModel, true);
    let rows = querySelectorAll(tbody, "tr");
    rows.forEach(row => {
      let offsetX = -1;
      querySelectorAll(row, "td").forEach((column, index) => {
        offsetX += getIntByAttr(column, "colspan", 1);
        if (fixedRight.tbody.indexOf("field-" + offsetX) === -1) {
          column.classList.add('is-hidden')
        }
      })
    })
    let bodyWrapper = createTabelWrapper("smart-table_fixed-body-wrapper", vm, "body", tbody);
    bodyWrapper.style.top = vm.size.theadHeight + "px";
    bodyWrapper.style.height = (vm.size.tbodyHeight - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
    let fixedContainer = createElement("div", "smart-table_fixed-right");
    fixedContainer.style.right = (vm.scrollY ? vm.gutterWidth : 0) + "px";
    appendChildren(fixedContainer, [headerWrapper, bodyWrapper]);
    fixedContainer.style.width = fixedRight.width + "px";
    fixedContainer.style.height = (vm.size.fixWrapperHeigth - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
    appendChild(vm.$root, fixedContainer);
    vm.$fixedRight = bodyWrapper;
    if (vm.scrollY) {
      let rightPatch = createElement("div", "smart-table_fixed-right-patch");
      rightPatch.style.width = vm.gutterWidth + "px";
      rightPatch.style.height = vm.size.theadHeight + "px";
      appendChild(vm.$root, rightPatch)
    }
  }
  vm.$root.style.minWidth = rootMinWidth + "px";
}

//根据表格中的tbody第一行 查出每列的宽度并记录
function getColgroup(thead, tbody, theadLength) {
  let arr = [];
  if (theadLength === 1) {
    //单行
    querySelectorAll(querySelector(thead, "tr"), "th").forEach(column => {
      let width = getIntByAttr(column, "width", 0);
      if (width === 0) {
        width = column.offsetWidth > 80 ? column.offsetWidth : 80;
      }
      arr.push(width)
    })
  } else {
    //多行
    querySelectorAll(querySelector(tbody, "tr"), "td").forEach(column => {
      let width = column.offsetWidth;
      if (width < 50) {
        width = width + 10;
      } else if (width >= 50 && width < 100) {
        width = width + 30;
      } else {
        width = width + 40;
      }
      arr.push(width)
    })
  }
  return arr;
}

function bindEvents(vm) {
  vm.$tbodyWrapper.addEventListener("scroll", () => syncPostion(vm), {
    passive: true
  })
  window.addEventListener("resize", debounce(600, () => {
    let table = vm.$root;
    let oldWrapperWidth = vm.size.wrapperWidth;
    let oldTableWidth = vm.size.tabelWidth;
    let newWrapperWidth = table.offsetWidth;
    let newTableWidth = parseInt(oldTableWidth * (newWrapperWidth / oldWrapperWidth));
    let headerWrapper = querySelector(vm.$theadWrapper, '.smart-table_header');
    let bodyWrapper = querySelector(vm.$tbodyWrapper, '.smart-table_body');
    vm.colgroup.forEach(function(item, index) {
      vm.colgroup[index] = parseInt(newTableWidth * (item / oldTableWidth)) + 1
    })
    vm.size.wrapperWidth = newWrapperWidth;
    vm.size.tabelWidth = newTableWidth;
    headerWrapper.style.width = newTableWidth + 'px';
    bodyWrapper.style.width = newTableWidth + 'px';
    // 替换colgroup
    replaceColGroup(vm, headerWrapper);
    replaceColGroup(vm, bodyWrapper);
    replaceFixedColGroup(vm, querySelector(table, '.smart-table_fixed'), newTableWidth);
    replaceFixedColGroup(vm, querySelector(table, '.smart-table_fixed-right'), newTableWidth);
  }))

  let trs = querySelectorAll(vm.$tbodyWrapper, 'tr');
  let fixedLeftTrs = querySelectorAll(vm.$root, '.smart-table_fixed .smart-table_fixed-body-wrapper tr');
  let fixedRightTrs = querySelectorAll(vm.$root, '.smart-table_fixed-right .smart-table_fixed-body-wrapper tr');
  trs.forEach((tr, trIndex) => {
    tr.addEventListener('mouseenter', () => {
      tr.className = 'smart-table_hover-tr';
      if (fixedLeftTrs.length > 0) fixedLeftTrs[trIndex].className = 'smart-table_hover-tr';
      if (fixedRightTrs.length > 0) fixedRightTrs[trIndex].className = 'smart-table_hover-tr';
    })
    tr.addEventListener('mouseleave', () => {
      tr.className = ''
      if (fixedLeftTrs.length > 0) fixedLeftTrs[trIndex].className = '';
      if (fixedRightTrs.length > 0) fixedRightTrs[trIndex].className = '';
    })
  })
}

function replaceFixedColGroup(vm, selector, newTableWidth) {
  if (selector) {
    let fixedHeader = querySelector(selector, '.smart-table_header');
    let fixedBody = querySelector(selector, '.smart-table_body');
    replaceColGroup(vm, fixedHeader);
    replaceColGroup(vm, fixedBody);
    const columns = querySelectorAll(querySelector(selector, "tr"), "th");
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

function initSortEvent(vm) {
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
  props.theadLength = rows.length;
  props.shapes = shapes;
  return props;
}

function initFixed(thead, vm) {
  let {
    colgroup,
    props
  } = vm;
  const columnLen = colgroup.length;
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
  const columns = querySelectorAll(querySelector(thead, "tr"), "th");
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
            fixedRight.tbody.push("field-" + (columnLen - rightCnt))
            fixedRight.width = fixedRight.width + colgroup[columnLen - rightCnt];
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
      querySelectorAll(row, "td .cell").forEach((cell, index) => {
        rowData["field-" + index] = cell.innerHTML;
      })
      data.push(rowData)
    }
  })
  return data;
}