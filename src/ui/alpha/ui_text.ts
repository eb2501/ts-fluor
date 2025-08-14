import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement, UIInlineElement } from "../ui_element"

class UIText extends UIInlineElement {
  private readonly text: Get<string>

  constructor(text: Get<string>) {
    super()
    this.text = text
  }

  readonly html = node(() => {
    const span = document.createElement("span")
    span.className = "fluor-uiText"

    const textTarget = (value?: string) => {
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
        this.text,
        textTarget,
      )
    )

    return span
  })
}

///////

export interface UITextArgs {
  text: ToGet<string>
}

export function uiText(args: UITextArgs): UIText {
  return new UIText(toGet(args.text))
}
