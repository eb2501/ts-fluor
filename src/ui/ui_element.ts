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
