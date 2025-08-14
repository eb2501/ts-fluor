import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement, UIInlineElement } from "../ui_element"

class UIText extends UIInlineElement {
  private readonly content: Get<string>

  constructor(content: Get<string>) {
    super()
    this.content = content
  }

  readonly html = node(() => {
    const span = document.createElement("span")
    span.className = "fluor-uiText"

    //
    // Content
    //

    const contentTarget = (value?: string) => {
      if (value === undefined) {
        return span.textContent
      } else {
        span.textContent = value
        return value
      }
    }

    attach(
      span,
      new OneWayPipe(
        this.content,
        contentTarget,
      )
    )

    return span
  })
}

///////

export interface UITextArgs {
  content: ToGet<string>
}

export function uiText(args: UITextArgs): UIText {
  return new UIText(toGet(args.content))
}
