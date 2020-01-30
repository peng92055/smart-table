export function createElement(tagName) {
  return document.createElement(tagName)
}

export function appendChild(node, child) {
  return node.appendChild(child);
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