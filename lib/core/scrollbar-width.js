import {
  appendChild,
  removeChild,
  createElement,
} from './node-ops';

let scrollBarWidth;

export default function() {
  if (scrollBarWidth !== undefined) return scrollBarWidth;

  const wrapper = createElement('div', 'smart-table');
  appendChild(document.body, wrapper);

  const outer = createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  appendChild(wrapper, outer)

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = createElement('div');
  inner.style.width = '100%';
  appendChild(outer, inner);

  const widthWithScroll = inner.offsetWidth;
  removeChild(wrapper.parentNode, wrapper);
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};