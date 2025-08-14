import { UIBlockElement, UIMonoContentElement, type UIElement } from "../ui_element"
import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"

class UIGroup extends UIMonoContentElement<"block"> {
  private readonly legend: Get<string>

  constructor(
    content: UIElement<"block">,
    legend: Get<string>,
  ) {
    super(content)
    this.legend = legend
  }

  readonly html = node(() => {
    const fieldset = document.createElement("fieldset")
    fieldset.className = "fluor-group"

    const legend = document.createElement("legend")
    fieldset.appendChild(legend)

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
    
    fieldset.appendChild(this.content.html())
    return fieldset
  })
}

///////

export function uiGroup(
  content: UIElement<"block">,
  legend: ToGet<string>
): UIBlockElement {
  return new UIGroup(
    content,
    toGet(legend)
  )
}
