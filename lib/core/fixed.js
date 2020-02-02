import {
  cloneNode,
  appendChild,
  appendChildren,
  createElement,
  querySelector,
  querySelectorAll
} from './node-ops';
import {
  getIntByAttr,
  createTabelWrapper,
} from './utils';

export default function(vm, theadModel, tbodyModel) {
  let rootMinWidth = 320;
  const { fixedLeft, fixedRight } = vm.props;

  //左边有固定列
  if (fixedLeft.thead.length > 0) {
    rootMinWidth = rootMinWidth > fixedLeft.width ? rootMinWidth : fixedLeft.width;
    const headerWrapper = createHeaderWrapper(vm, theadModel, fixedLeft);
    const bodyWrapper = createBodyWrapper(vm, tbodyModel, fixedLeft, 'left');
    appendChild(vm.$root, createContainer(vm, headerWrapper, bodyWrapper, fixedLeft, 'smart-table_fixed', 'left'));
    vm.$fixedLeft = bodyWrapper;
  }
  //右边有固定列
  if (fixedRight.thead.length > 0) {
    rootMinWidth = rootMinWidth + fixedRight.width;
    const headerWrapper = createHeaderWrapper(vm, theadModel, fixedRight);
    const bodyWrapper = createBodyWrapper(vm, tbodyModel, fixedRight, 'right');
    appendChild(vm.$root, createContainer(vm, headerWrapper, bodyWrapper, fixedRight, 'smart-table_fixed-right', 'right'));
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

function createHeaderWrapper(vm, model, meta) {
  let thead = cloneNode(model, true);
  querySelectorAll(querySelector(thead, "tr"), "th").forEach((column, index) => {
    if (meta.thead.indexOf("field-" + index) === -1) {
      column.classList.add('is-hidden')
    }
  })
  return createTabelWrapper("smart-table_fixed-header-wrapper", vm, "header", thead);
}

function createBodyWrapper(vm, model, meta, type) {
  let tbody = cloneNode(model, true);
  let rows = querySelectorAll(tbody, "tr");
  rows.forEach(row => {
    let offsetX = -1;
    querySelectorAll(row, "td").forEach((column, index) => {
      if (type === 'left') {
        offsetX = index
      } else {
        offsetX += getIntByAttr(column, "colspan", 1);
      }
      if (meta.tbody.indexOf("field-" + offsetX) === -1) {
        column.classList.add('is-hidden')
      }
    })
  })
  let bodyWrapper = createTabelWrapper("smart-table_fixed-body-wrapper", vm, "body", tbody);
  bodyWrapper.style.top = vm.size.theadHeight + "px";
  bodyWrapper.style.height = (vm.size.tbodyHeight - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
  return bodyWrapper
}

function createContainer(vm, thead, tbody, meta, className, type) {
  let fixedContainer = createElement("div", className);
  type === 'right' && (fixedContainer.style.right = (vm.scrollY ? vm.gutterWidth : 0) + "px");
  appendChildren(fixedContainer, [thead, tbody]);
  fixedContainer.style.width = meta.width + "px";
  fixedContainer.style.height = (vm.size.fixWrapperHeigth - (vm.scrollX ? vm.gutterWidth : 0)) + "px";
  return fixedContainer
}