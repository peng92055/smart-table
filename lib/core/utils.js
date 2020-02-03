import {
  appendChild,
  removeChild,
  createElement,
  querySelector,
  appendChildren,
} from './node-ops';

export function refactorCell(cell) {
  let nodes = cell.childNodes;
  let wrapper = createElement("div", "smart-table_cell");
  while (nodes.length) {
    appendChild(wrapper, nodes[0])
  }
  appendChild(cell, wrapper)
}

export function createTabelWrapper(className, vm, type, content, hasGutter) {
  let wrapper = createElement("div", className);
  let table = createElement("table", "smart-table_" + type);
  table.style.width = (vm.size.tabelWidth - 1) + "px";
  appendChildren(table, [createColgroup(vm.colgroup, vm.gutterWidth, hasGutter), content])
  appendChild(wrapper, table)
  return wrapper;
}

export function replaceColGroup(vm, wrapper) {
  let colgroup = createColgroup(vm.colgroup);
  wrapper.replaceChild(colgroup, querySelector(wrapper, 'colgroup'));
}

export function getIntByAttr(el, key, def) {
  return Number.parseInt(el.getAttribute(key) || def)
}

export function getEmptyIndexInArray(array) {
  for (let i = 0, len = array.length; i < len; i++) {
    if (array[i] === undefined) {
      return i
    }
  }
}

export function throttle(delay, callback) {
  let timeoutID;
  let lastExec = 0;

  function wrapper() {

    let self = this;
    let elapsed = new Date().getTime() - lastExec;
    let args = arguments;

    function exec() {
      lastExec = new Date().getTime();
      callback.apply(self, args)
    }

    if (timeoutID) {
      clearTimeout(timeoutID)
    }

    if (elapsed > delay) {
      exec()
    } else {
      timeoutID = setTimeout(exec, delay - elapsed)
    }
  }

  return wrapper;
}

export function debounce(delay, callback) {
  let timeout = null;
  return function() {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  }
}

function createColgroup(arr, gutterWidth, hasGutter) {
  if (!arr) return;
  let colgroup = createElement("colgroup");
  arr.forEach(item => {
    let col = createElement("col");
    col.setAttribute("width", item);
    appendChild(colgroup, col)
  })
  if (hasGutter) {
    let col = createElement("col");
    col.setAttribute("width", gutterWidth)
    appendChild(colgroup, col)
  }
  return colgroup;
}