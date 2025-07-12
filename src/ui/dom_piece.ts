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

export abstract class DomPiece {
  readonly id: number
  readonly dynClassAttrs: string[] = []
  readonly dynStyleAttrs: string[] = []
  readonly dynAttrs: string[] = []
  readonly dynChildren: (string | number)[] = []

  constructor(id: number) {
    this.id = id
  }

  abstract initHtml(): HTMLElement
  
  freeHtml(html: HTMLElement): void {}

  buildHtml(resolver: (id: number) => HTMLElement, html: HTMLElement) {
    html.classList.add(...this.dynClassAttrs)
    const dynStyleAttrs = this.dynStyleAttrs
    for (let i = 0; i < dynStyleAttrs.length; i += 2) {
      const key = dynStyleAttrs[i]
      const value = dynStyleAttrs[i + 1]
      html.style.setProperty(key, value)
    }
    const dynAttrs = this.dynAttrs
    for (let i = 0; i < dynAttrs.length; i += 2) {
      const key = dynAttrs[i]
      const value = dynAttrs[i + 1]
      html.setAttribute(key, value)
    }
    html.replaceChildren(...this.dynChildren.map((child) => {
      if (typeof child === "number") {
        return resolver(child)
      } else {
        return document.createTextNode(child)
      }
    }))
  }

  updateHtml(
    resolver: (id: number) => HTMLElement,
    piece: DomPiece,
    html: HTMLElement
  ) {
    applySetDiff(
      this.dynClassAttrs,
      piece.dynClassAttrs,
      (attr) => html.classList.add(attr),
      (attr) => html.classList.remove(attr)
    )
    applyMapDiff(
      this.dynStyleAttrs,
      piece.dynStyleAttrs,
      (key, value) => html.style.setProperty(key, value),
      (key) => html.style.removeProperty(key),
      (key, value) => html.style.setProperty(key, value)
    )
    applyMapDiff(
      this.dynAttrs,
      piece.dynAttrs,
      (key, value) => html.setAttribute(key, value),
      (key) => html.removeAttribute(key),
      (key, value) => html.setAttribute(key, value)
    )
    html.replaceChildren(...this.dynChildren.map((child) => {
      if (typeof child === "number") {
        return resolver(child)
      } else {
        return document.createTextNode(child)
      }
    }))
  }
}
