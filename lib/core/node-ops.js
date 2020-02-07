export function createElement(tagName, className) {
  let node = document.createElement(tagName)
  className && (node.className = className)
  return node
}

export function appendChild(node, child) {
  return node.appendChild(child)
}

export function hasAttribute(node, attrName) {
  return node.hasAttribute(attrName)
}

export function setAttribute(node, attrName, attrValue) {
  return node.setAttribute(attrName, attrValue || true)
}

export function getAttribute(node, attrName) {
  return node.getAttribute(attrName)
}

export function removeAttribute(node, attrName) {
  return node.removeAttribute(attrName)
}

export function appendChildren(node, children) {
  children.forEach(child => {
    node.appendChild(child)
  })
  return node
}

export function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function nextSibling(node) {
  return node.nextSibling
}

export function removeChild(node, child) {
  node.removeChild(child)
}

export function cloneNode(node, deep) {
  return node.cloneNode(deep)
}

export function querySelector(node, query) {
  return node.querySelector(query)
}

export function querySelectorAll(node, query) {
  return node.querySelectorAll(query)
}

export function offsetHeight(node) {
  return node.offsetHeight
}

export function offsetWidth(node) {
  return node.offsetWidth
}

export function styled(node, styles) {
  for (let key in styles) {
    node.style[key] = styles[key]
  }
  return node
}