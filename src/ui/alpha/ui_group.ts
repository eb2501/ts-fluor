import { UIBlockElement, type UIElement } from "../ui_element"
import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"

class UIGroupElement extends UIBlockElement {
  private readonly content: Get<UIElement<"block">>
  private readonly legend: Get<string>

  constructor(
    content: Get<UIElement<"block">>,
    legend: Get<string>,
  ) {
    super()
    this.content = content
    this.legend = legend
  }

  readonly html = node(() => {
    const fieldset = document.createElement("fieldset")
    fieldset.className = "fluor-group"

    const legend = document.createElement("legend")
    fieldset.appendChild(legend)

    //
    // Legend
    //

    const legendTarget = (value?: string) => {
      if (value === undefined) {
        return legend.textContent || ""
      } else {
        legend.textContent = value
        return value
      }
    }

    attach(
      legend,
      new OneWayPipe(
        this.legend,
        legendTarget,
      )
    )
    
    const div = document.createElement("div")
    fieldset.appendChild(div)

    //
    // Content
    //

    const childrenSource = () => [this.content().html()]

    const childrenTarget = (value?: HTMLElement[]) => {
      if (value === undefined) {
        return Array.from(div.children).map(c => c as HTMLElement)
      } else {
        div.replaceChildren(...value)
        return value
      }
    }

    attach(
      div,
      new OneWayPipe(
        childrenSource,
        childrenTarget
      )
    )

    return fieldset
  })
}

///////

export interface UIGroupArgs {
  content: ToGet<UIElement<"block">>,
  legend: ToGet<string>,
}

export function uiGroup(args: UIGroupArgs): UIBlockElement {
  return new UIGroupElement(
    toGet(args.content),
    toGet(args.legend)
  )
}
