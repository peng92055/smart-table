import {
  cloneNode,
  appendChild,
  appendChildren,
  createElement,
  querySelectorAll
} from './node-ops';
import {
  getAttrNumber,
  createTableWrapper,
} from './utils';

export default function(vm, theadModel, tbodyModel) {
  let rootMinWidth = 320;
  const { fixedLeft, fixedRight } = vm.props;

  //左边有固定列
  if (fixedLeft.thead.length > 0) {
    rootMinWidth = rootMinWidth > fixedLeft.width ? rootMinWidth : fixedLeft.width;
    const headerWrapper = createHeaderWrapper(vm, theadModel, fixedLeft);
    const bodyWrapper = createBodyWrapper(vm, tbodyModel, fixedLeft, 'left');
    vm.$fixedLeft = createContainer(vm, headerWrapper, bodyWrapper, fixedLeft, 'stb_fixed', 'left');
    appendChild(vm.$root, vm.$fixedLeft);
    vm.$fixedLeftBody = bodyWrapper;
  }
  //右边有固定列
  if (fixedRight.thead.length > 0) {
    rootMinWidth = rootMinWidth + fixedRight.width;
    const headerWrapper = createHeaderWrapper(vm, theadModel, fixedRight);
    const bodyWrapper = createBodyWrapper(vm, tbodyModel, fixedRight, 'right');
    vm.$fixedRight = createContainer(vm, headerWrapper, bodyWrapper, fixedRight, 'stb_fixed-right', 'right');
    appendChild(vm.$root, vm.$fixedRight);
    vm.$fixedRightBody = bodyWrapper;

    let rightPatch = createElement("div", "stb_fixed-right-patch");
    rightPatch.style.display = 'none';
    rightPatch.style.width = vm.gutterWidth + "px";
    rightPatch.style.height = vm.$thead.offsetHeight + "px";
    appendChild(vm.$root, rightPatch)
    vm.$rightPatch = rightPatch;
    if (vm.scrollY) {
      vm.$rightPatch.style.display = 'block'
    }
  }
  vm.$root.style.minWidth = rootMinWidth + "px";
}

function createHeaderWrapper(vm, model, meta) {
  const thead = cloneNode(model, true);
  querySelectorAll(thead, "tr:first-child>th").forEach((column, index) => {
    if (meta.thead.indexOf("field-" + index) === -1) {
      column.classList.add('is-hidden')
    }
  })
  return createTableWrapper("stb_fixed-header-wrapper", vm, "header", thead);
}

function createBodyWrapper(vm, model, meta, type) {
  const tbody = cloneNode(model, true);
  const rows = querySelectorAll(tbody, "tr");
  rows.forEach(row => {
    let offsetX = -1;
    querySelectorAll(row, "td").forEach((column, index) => {
      if (type === 'left') {
        offsetX = index
      } else {
        offsetX += getAttrNumber(column, "colspan", 1);
      }
      if (meta.tbody.indexOf("field-" + offsetX) === -1) {
        column.classList.add('is-hidden')
      }
    })
  })
  const bodyWrapper = createTableWrapper("stb_fixed-body-wrapper", vm, "body", tbody);
  bodyWrapper.style.top = vm.$thead.offsetHeight + "px";
  bodyWrapper.style.height = (vm.size.tbodyWrapperHeight - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
  return bodyWrapper
}

function createContainer(vm, thead, tbody, meta, className, type) {
  const fixedContainer = createElement("div", className);
  type === 'right' && (fixedContainer.style.right = (vm.scrollY ? vm.gutterWidth : 0) + "px");
  appendChildren(fixedContainer, [thead, tbody]);
  fixedContainer.style.width = meta.width + "px";
  let height = (vm.$root.offsetHeight - (vm.scrollX ? vm.gutterWidth : 2));
  const tableHeight = vm.$thead.offsetHeight + vm.$tbody.offsetHeight;
  height = tableHeight > height ? height : tableHeight
  fixedContainer.style.height = height + "px";
  return fixedContainer
}