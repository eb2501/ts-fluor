import { attach, once, OneWayPipe, view, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement } from "../ui_element"

class UIPara extends UIBlockElement {
  private readonly content: Get<UIElement<"inline">[]>

  constructor(content: ToGet<UIElement<"inline">[]>) {
    super()
    this.content = toGet(content)
  }

  readonly html = once(() => {
    const p = document.createElement("p")
    p.className = "fluor-uiPara"

    const childrenSource = view(() => {
      const array: Element[] = []
      for (const item of this.content()) {
        array.push(item.html())
      }
      return array
    })

    const childrenTarget = view(
      () => Array.from(p.children),
      (value) => p.replaceChildren(...value)
    )

    attach(
      p,
      new OneWayPipe(
        childrenSource,
        childrenTarget,
      )
    )

    return p
  })
}

///////

export function uiPara(content: ToGet<UIElement<"inline">[]>): UIElement<"block"> {
  return new UIPara(content)
}
