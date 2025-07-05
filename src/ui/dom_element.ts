import invariant from "tiny-invariant"

function applySetDiff(
  oldSet: string[],
  newSet: string[],
  addFn: (attr: string) => void,
  removeFn: (attr: string) => void
): void {
  let oldIndex = 0
  let newIndex = 0
  while (oldIndex < oldSet.length || newIndex < newSet.length) {
    if (oldIndex == oldSet.length) {
      addFn(newSet[newIndex])
      newIndex++
    } else if (newIndex == newSet.length) {
      removeFn(oldSet[oldIndex])
      oldIndex++
    } else {
      const oldAttr = oldSet[oldIndex]
      const newAttr = newSet[newIndex]
      if (oldAttr < newAttr) {
        removeFn(oldAttr)
        oldIndex++
      } else if (oldAttr > newAttr) {
        addFn(newAttr)
        newIndex++
      } else {
        oldIndex++
        newIndex++
      }
    }
  }
}

function applyMapDiff(
  oldMap: string[],
  newMap: string[],
  addFn: (key: string, value: string) => void,
  removeFn: (key: string) => void,
  updateFn: (key: string, value: string) => void
): void {
  let oldIndex = 0
  let newIndex = 0
  while (oldIndex < oldMap.length || newIndex < newMap.length) {
    if (oldIndex == oldMap.length) {
      const newKey = newMap[newIndex]
      const newValue = newMap[newIndex + 1]
      addFn(newKey, newValue)
      newIndex += 2
    } else if (newIndex == newMap.length) {
      const oldKey = oldMap[oldIndex]
      removeFn(oldKey)
      oldIndex += 2
    } else {
      const oldKey = oldMap[oldIndex]
      const newKey = newMap[newIndex]
      if (oldKey < newKey) {
        oldIndex += 2
        removeFn(oldKey)
      } else if (oldKey > newKey) {
        const newValue = newMap[newIndex + 1]
        addFn(newKey, newValue)
        newIndex += 2
      } else {
        const oldValue = oldMap[oldIndex + 1]
        const newValue = newMap[newIndex + 1]
        if (oldValue !== newValue) {
          updateFn(newKey, newValue)
        }
        oldIndex += 2
        newIndex += 2
      }
    }
  }
}

export class DomElement {
  readonly id: number
  readonly tag: string
  readonly staticClassAttrs: string[] | null
  readonly dynamicClassAttrs: string[] | null
  readonly staticStyleAttrs: string[] | null
  readonly dynamicStyleAttrs: string[] | null
  readonly staticAttrs: string[] | null
  readonly dynamicAttrs: string[] | null
  readonly children: (string | number)[] | null

  constructor(
    id: number,
    tag: string,
    staticClassAttrs: string[] | null,
    dynamicClassAttrs: string[] | null,
    staticStyleAttrs: string[] | null,
    dynamicStyleAttrs: string[] | null,
    staticAttrs: string[] | null,
    dynamicAttrs: string[] | null,
    children: (string | number)[] | null
  ) {
    invariant(tag, "Tag must be a non-empty string")
    invariant(
      !staticStyleAttrs || staticStyleAttrs.length % 2 === 0,
      "Static style attributes must be in key-value pairs"
    )
    invariant(
      !dynamicStyleAttrs || dynamicStyleAttrs.length % 2 === 0,
      "Dynamic style attributes must be in key-value pairs"
    )
    invariant(
      !staticAttrs || staticAttrs.length % 2 === 0,
      "Static attributes must be in key-value pairs"
    )
    invariant(
      !dynamicAttrs || dynamicAttrs.length % 2 === 0,
      "Dynamic attributes must be in key-value pairs"
    )
    this.id = id
    this.tag = tag
    this.staticClassAttrs = staticClassAttrs && staticClassAttrs.length > 0 ? staticClassAttrs : null
    this.dynamicClassAttrs = dynamicClassAttrs && dynamicClassAttrs.length > 0 ? dynamicClassAttrs : null
    this.staticStyleAttrs = staticStyleAttrs && staticStyleAttrs.length > 0 ? staticStyleAttrs : null
    this.dynamicStyleAttrs = dynamicStyleAttrs && dynamicStyleAttrs.length > 0 ? dynamicStyleAttrs : null
    this.staticAttrs = staticAttrs && staticAttrs.length > 0 ? staticAttrs : null
    this.dynamicAttrs = dynamicAttrs && dynamicAttrs.length > 0 ? dynamicAttrs : null
    this.children = children && children.length > 0 ? children : null
  }

  update(mapping: Map<number, [DomElement, HTMLElement]>): HTMLElement {
    const [dom, html] = mapping.get(this.id)!
    applySetDiff(
      dom.dynamicClassAttrs || [],
      this.dynamicClassAttrs || [],
      (attr) => html.classList.add(attr),
      (attr) => html.classList.remove(attr)
    )
    applyMapDiff(
      dom.dynamicStyleAttrs || [],
      this.dynamicStyleAttrs || [],
      (key, value) => html.style.setProperty(key, value),
      (key) => html.style.removeProperty(key),
      (key, value) => html.style.setProperty(key, value)
    )
    applyMapDiff(
      dom.dynamicAttrs || [],
      this.dynamicAttrs || [],
      (key, value) => html.setAttribute(key, value),
      (key) => html.removeAttribute(key),
      (key, value) => html.setAttribute(key, value)
    )
    if (dom.children) {
      const children = []
      for (const child of this.children || []) {
        if (typeof child === "number") {
          invariant(mapping.has(child), `Child element with id [${child}] not found in mapping`)
          const [_, childHtml] = mapping.get(child)!
          children.push(childHtml)
        } else {
          invariant(typeof child === "string", `Child must be a string or number, got [${typeof child}]`)
          const textNode = document.createTextNode(child)
          children.push(textNode)
        }
      }
      html.replaceChildren(...children)
    }
    return html
  }

  create(mapping: Map<number, [DomElement, HTMLElement]>): HTMLElement {
    const element = document.createElement(this.tag)
    if (this.staticClassAttrs) {
      for (const attr of this.staticClassAttrs) {
        element.classList.add(attr)
      }
    }
    if (this.dynamicClassAttrs) {
      for (const attr of this.dynamicClassAttrs) {
        element.classList.add(attr)
      }
    }
    if (this.staticStyleAttrs) {
      for (let i = 0; i < this.staticStyleAttrs.length; i += 2) {
        const key = this.staticStyleAttrs[i]
        const value = this.staticStyleAttrs[i + 1]
        element.style.setProperty(key, value)
      }
    }
    if (this.dynamicStyleAttrs) {
      for (let i = 0; i < this.dynamicStyleAttrs.length; i += 2) {
        const key = this.dynamicStyleAttrs[i]
        const value = this.dynamicStyleAttrs[i + 1]
        element.style.setProperty(key, value)
      }
    }
    if (this.staticAttrs) {
      for (let i = 0; i < this.staticAttrs.length; i += 2) {
        const key = this.staticAttrs[i]
        const value = this.staticAttrs[i + 1]
        element.setAttribute(key, value)
      }
    }
    if (this.dynamicAttrs) {
      for (let i = 0; i < this.dynamicAttrs.length; i += 2) {
        const key = this.dynamicAttrs[i]
        const value = this.dynamicAttrs[i + 1]
        element.setAttribute(key, value)
      }
    }
    if (this.children) {
      for (const child of this.children) {
        if (typeof child === "number") {
          invariant(mapping.has(child), `Child element with id [${child}] not found in mapping`)
          const [_, html] = mapping.get(child)!
          element.appendChild(html)
        } else {
          invariant(typeof child === "string", `Child must be a string or number, got [${typeof child}]`)
          const textNode = document.createTextNode(child)
          element.appendChild(textNode)
        }
      }
    }
    return element
  }
}
