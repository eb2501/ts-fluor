import { node, type Get, OneWayPipe, attach } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, UIMonoContentElement, type UIType } from "../ui_element"

class UITooltip<T extends UIType> extends UIMonoContentElement<T> {
  private readonly tooltip: Get<string>

  constructor(
    content: UIElement<T>,
    tooltip: Get<string>,
  ) {
    super(content)
    this.tooltip = tooltip
  }

  readonly html = node(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = 'fluor-uiTooltip'

    const tooltipTarget = (value? : string) => {
      if (value === undefined) {
        return html.getAttribute("title") || ""
      } else {
        if (value) {
          html.setAttribute("title", value)
        } else {
          html.removeAttribute("title")
        }
        return value
      }
    }

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

export interface UITooltipArgs<T extends UIType> {
  content: UIElement<T>
  tooltip: ToGet<string>
}

export function uiTooltip<T extends UIType>(
  args: UITooltipArgs<T>
): UIElement<T> {
  return new UITooltip(
    args.content,
    toGet(args.tooltip)
  )
}
