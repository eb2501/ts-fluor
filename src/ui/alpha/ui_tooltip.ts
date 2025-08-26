import { type Get, OneWayPipe, attach, once, view } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, type UIType } from "../ui_element"

class UITooltip<T extends UIType> extends UIElement<T> {
  private readonly content: UIElement<T>
  private readonly text: Get<string>

  constructor(
    content: UIElement<T>,
    text: ToGet<string>,
  ) {
    super()
    this.content = content
    this.text = toGet(text)
  }

  readonly type = once(() => this.content.type())

  readonly html = once(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = "fluor-uiTooltip"

    const textTarget = view(
      () => html.getAttribute("title") || "",
      (value) => {
        if (value) {
          html.setAttribute("title", value)
        } else {
          html.removeAttribute("title")
        }
      }
    )

    attach(
      html,
      new OneWayPipe(
        this.text,
        textTarget
      )
    )

    html.appendChild(this.content.html())
    return html
  })
}

///////

export function uiTooltip<T extends UIType>({
  content,
  text
}: {
  content: UIElement<T>,
  text: ToGet<string>
}): UIElement<T> {
  return new UITooltip(content, text)
}
