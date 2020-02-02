export default function(vm, key, sortType, sortOrder) {
  if (!vm.data || vm.data.length < 1) return;
  //使用快速排序
  let vnode = quickSort(JSON.parse(JSON.stringify(vm.data)), key, sortType, sortOrder);
  //判断顺序是否改变过
  if (JSON.stringify(vm.data) !== JSON.stringify(vnode)) {
    //计算需要更新的最小路径，并移动元素
    diff(vm.data, vnode);
    //更新为新的data
    vm.data = vnode;
  }
}

//借鉴react diff算法实现
function diff(oldVnode, vnode) {
  let lastIndex = 0;
  for (let i = 0; i < vnode.length; i++) {
    const nextVNode = vnode[i];
    let j = 0;
    for (j; j < oldVnode.length; j++) {
      const prevVNode = oldVnode[j];
      if (nextVNode.$key === prevVNode.$key) {
        nextVNode.$el = prevVNode.$el;
        nextVNode.$fixedLeftEl = prevVNode.$fixedLeftEl;
        nextVNode.$fixedRightEl = prevVNode.$fixedRightEl;
        if (j < lastIndex) {
          //需要移动
          const lastNextVNode = vnode[i - 1];

          const refNode = lastNextVNode.$el.nextSibling;
          refNode.parentNode.insertBefore(prevVNode.$el, refNode);

          if (lastNextVNode.$fixedLeftEl) {
            const refLeftNode = lastNextVNode.$fixedLeftEl.nextSibling;
            refLeftNode.parentNode.insertBefore(prevVNode.$fixedLeftEl, refLeftNode);
          }

          if (lastNextVNode.$fixedRightEl) {
            const refRightNode = lastNextVNode.$fixedRightEl.nextSibling;
            refRightNode.parentNode.insertBefore(prevVNode.$fixedRightEl, refRightNode);
          }
        } else {
          lastIndex = j;
        }
        break;
      }
    }
  }
}

function quickSort(arr, key, sortType, sortOrder) {
  if (arr.length <= 1) {
    return arr
  }
  let left = [],
    right = [];
  let len = arr.length;
  let pivotIndex = Math.floor(len / 2);
  let pivot = arr.splice(pivotIndex, 1)[0];
  for (let i = 0; i < len - 1; i++) {
    if (compare(arr[i][key], pivot[key], sortType, sortOrder)) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quickSort(left, key, sortType, sortOrder).concat(pivot, quickSort(right, key, sortType, sortOrder));
}

function compare(key1, key2, sortType, sortOrder) {
  if (sortOrder === "number") {
    key1 = parseFloat(key1);
    key2 = parseFloat(key2);
  }
  return sortType === 'ASC' ? key1 < key2 : key1 > key2;
}