export function createTabelWrapper(className, vm, type, content) {
  let wrapper = document.createElement("div");
  wrapper.className = className;
  let table = document.createElement("table");
  table.className = "smart-table_" + type;
  table.style.width = (vm.size.tabelWidth - 1) + "px";
  table.appendChild(createColgroup(vm.colgroup));
  table.appendChild(content);
  wrapper.appendChild(table);
  return wrapper;
}

export function replaceColGroup(vm, wrapper) {
  let colgroup = createColgroup(vm.colgroup);
  wrapper.replaceChild(colgroup, wrapper.querySelector('colgroup'));
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

    function clear() {
      timeoutID = undefined;
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
  return function () {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  }
}

export function isWindows() {
  var agent = navigator.userAgent.toLowerCase();
  if (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) {
    return true;
  }
  if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
    return true;
  }
  return false;
}

//创建colgroup节点
function createColgroup(arr) {
  if (!arr) return;
  let colgroup = document.createElement("colgroup");
  arr.forEach(item => {
    let col = document.createElement("col");
    col.setAttribute("width", item);
    colgroup.appendChild(col)
  })
  return colgroup;
}
