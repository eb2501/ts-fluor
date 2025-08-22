import { type Once, once } from "../core"

export type UIType = "block" | "inline"

export abstract class UIElement<T extends UIType> {
  abstract readonly html: Once<HTMLElement>
  abstract readonly type: Once<T>
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
  readonly type = once(() => "block" as const)
}

export abstract class UIInlineElement extends UIElement<"inline"> {
  readonly type = once(() => "inline" as const)
}

///////

export abstract class UIMonoContentElement<T extends UIType> extends UIElement<T> {
  protected readonly content: UIElement<T>

  constructor(content: UIElement<T>) {
    super()
    this.content = content
  }

  readonly type = once(() => this.content.type())
}

///////

export abstract class UIMultiContentElement<T extends UIType> extends UIElement<T> {
  protected readonly content: UIElement<T>[]

  constructor(content: UIElement<T>[]) {
    super()
    if (content.length === 0) {
      throw new Error('Content should have at least one element')
    }
    this.content = content
  }

  readonly type = once(() => this.content[0].type())
}
