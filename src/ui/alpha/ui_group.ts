import { UIBlockElement, type UIElement } from "../ui_element"
import { attach, OneWayPipe, type Get, once, view } from "../../core"
import { toGet, type ToGet } from "../convert"

class UIGroup extends UIBlockElement {
  private readonly content: UIElement<"block">
  private readonly legend: Get<string>

  constructor(
    content: UIElement<"block">,
    legend: ToGet<string>,
  ) {
    super()
    this.content = content
    this.legend = toGet(legend)
  }

  readonly html = once(() => {
    const fieldset = document.createElement("fieldset")
    fieldset.className = "fluor-uiGroup"

    const legend = document.createElement("legend")
    fieldset.appendChild(legend)

    const legendTarget = view(
      () => legend.textContent || "",
      (value) => legend.textContent = value
    )

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
  legend: ToGet<string>,
): UIElement<"block"> {
  return new UIGroup(content, legend)
}
