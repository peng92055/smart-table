import {
  appendChild,
  getAttribute,
  createElement,
  querySelector,
  appendChildren,
  querySelectorAll,
} from './node-ops';

export function refactorCell(cell) {
  let nodes = cell.childNodes;
  let wrapper = createElement("div", "stb_cell");
  while (nodes.length) {
    appendChild(wrapper, nodes[0])
  }
  appendChild(cell, wrapper)
}

export function createTableWrapper(className, vm, type, content) {
  let wrapper = createElement("div", className);
  let table = createElement("table", "stb_" + type);
  table.style.width = vm.size.tableWidth + "px";
  appendChildren(table, [createColgroup(vm.colgroup), content])
  appendChild(wrapper, table)
  return wrapper;
}

export function replaceColGroup(vm) {
  querySelectorAll(vm.$root, 'table').forEach(table => {
    table.style.width = vm.size.tableWidth + "px";
    table.replaceChild(createColgroup(vm.colgroup), querySelector(table, 'colgroup'));
  })
}

export function getAttrNumber(el, key, def) {
  return Number.parseInt(getAttribute(el, key) || def)
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

    const self = this;
    const elapsed = new Date().getTime() - lastExec;
    const args = arguments;

    function exec() {
      lastExec = new Date().getTime();
      callback.apply(self, args)
    }

    timeoutID && clearTimeout(timeoutID)

    if (elapsed > delay) {
      exec()
    } else {
      timeoutID = setTimeout(exec, delay - elapsed)
    }
  }

  return wrapper;
}

export function debounce(delay, callback) {
  let timeoutID;

  function wrapper() {

    const self = this;
    const args = arguments;

    function exec() {
      callback.apply(self, args)
    }

    timeoutID && clearTimeout(timeoutID)

    timeoutID = setTimeout(exec, delay)
  }

  return wrapper;
}

function createColgroup(arr) {
  if (!arr) return;
  let colgroup = createElement("colgroup");
  arr.forEach(item => {
    let col = createElement("col");
    col.setAttribute("width", item);
    appendChild(colgroup, col)
  })
  return colgroup;
}