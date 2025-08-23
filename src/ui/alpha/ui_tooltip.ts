import { type Get, OneWayPipe, attach, once, view } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, type UIType } from "../ui_element"

class UITooltip<T extends UIType> extends UIElement<T> {
  private readonly content: UIElement<T>
  private readonly tooltip: Get<string>

  constructor(
    content: UIElement<T>,
    tooltip: ToGet<string>,
  ) {
    super()
    this.content = content
    this.tooltip = toGet(tooltip)
  }

  readonly type = once(() => this.content.type())
  
  readonly html = once(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = "fluor-uiTooltip"

    const tooltipTarget = view(
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
        this.tooltip,
        tooltipTarget
      )
    )

    html.appendChild(this.content.html())
    return html
  })
}

///////

export function uiTooltip<T extends UIType>(
  content: UIElement<T>,
  tooltip: ToGet<string>
): UIElement<T> {
  return new UITooltip(content, tooltip)
}
