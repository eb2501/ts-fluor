import { node, type Get, OneWayPipe, attach } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, type UIType } from "../ui_element"

class UITooltipElement<T extends UIType> extends UIElement<T> {
  private readonly tooltip: Get<string>
  private readonly content: Get<UIElement<T>>

  constructor(
    tooltip: Get<string>,
    content: Get<UIElement<T>>
  ) {
    super()
    this.tooltip = tooltip
    this.content = content
  }

  type(): T {
    return this.content().type()
  }
  
  readonly html = node(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = 'fluor-uiTooltip'

    //
    // Tooltip
    //

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

    //
    // Content
    //

    const childrenSource = () => [this.content().html()]

    const childrenTarget = (value?: HTMLElement[]) => {
      if (value === undefined) {
        return Array.from(html.children).map(c => c as HTMLElement)
      } else {
        html.replaceChildren(...value)
        return value
      }
    }

    attach(
      html,
      new OneWayPipe(
        childrenSource,
        childrenTarget
      )
    )

    return html
  })
}

///////

export interface UITooltipArgs<T extends UIType> {
  tooltip: ToGet<string>
  content: ToGet<UIElement<T>>
}

export function uiTooltip<T extends UIType>(
  args: UITooltipArgs<T>
): UIElement<T> {
  return new UITooltipElement(
    toGet(args.tooltip),
    toGet(args.content)
  )
}
