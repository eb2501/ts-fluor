import { type Get } from "../core"

export type UIType = "block" | "inline"

export abstract class UIElement<T extends UIType> {
  abstract readonly html: Get<HTMLElement>
  abstract type(): T
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
