import {
  appendChild,
  removeChild,
  createElement,
  offsetWidth,
  styled,
} from './node-ops';

let scrollBarWidth;

export default function() {
  if (scrollBarWidth !== undefined) return scrollBarWidth;

  const wrapper = createElement('div', 'smart-table');
  appendChild(document.body, wrapper);

  const outer = createElement('div');
  styled(outer, {
    visibility: 'hidden',
    width: '100px',
    position: 'absolute',
    top: '-9999px'
  })
  appendChild(wrapper, outer)

  const widthNoScroll = offsetWidth(outer);
  styled(outer, {
    overflow: 'scroll'
  })

  const inner = createElement('div');
  styled(inner, { width: '100%' })
  appendChild(outer, inner);

  const widthWithScroll = offsetWidth(inner);
  removeChild(wrapper.parentNode, wrapper);
  scrollBarWidth = widthNoScroll - widthWithScroll;
  return scrollBarWidth;
};