import { type Get } from "../core"

export type UIType = "block" | "inline"

export abstract class UIElement<T extends UIType> {
  abstract readonly html: Get<HTMLElement>
  abstract type(): T
}

///////

export function isInline(element: unknown): element is UIElement<"inline"> {
  return (typeof element == "object")
      && (element instanceof UIElement)
      && (element.type() === "inline")
}

export function isBlock(element: unknown): element is UIElement<"block"> {
  return (typeof element == "object")
      && (element instanceof UIElement)
      && (element.type() === "block")
}

///////

export abstract class UIBlockElement extends UIElement<"block"> {
  type(): "block" {
    return "block"
  }
}

export abstract class UIInlineElement extends UIElement<"inline"> {
  type(): "inline" {
    return "inline"
  }
}

///////

export abstract class UIMonoContentElement<T extends UIType> extends UIElement<T> {
  protected readonly content: UIElement<T>

  constructor(content: UIElement<T>) {
    super()
    this.content = content
  }

  type(): T {
    return this.content.type()
  }
}

///////

export abstract class UIMultiContentElement<T extends UIType> extends UIElement<T> {
  protected readonly contents: UIElement<T>[]

  constructor(contents: UIElement<T>[]) {
    super()
    this.contents = contents
  }

  type(): T {
    return this.contents[0].type()
  }
}
