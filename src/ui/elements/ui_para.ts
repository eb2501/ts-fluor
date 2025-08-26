import { attach, once, OneWayPipe, view, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement } from "../ui_element"

export type UIParaItem = UIElement<"inline"> | string

class UIPara extends UIBlockElement {
  private readonly content: Get<UIParaItem[]>

  constructor(content: ToGet<UIParaItem[]>) {
    super()
    this.content = toGet(content)
  }

  readonly html = once(() => {
    const p = document.createElement("p")
    p.className = "fluor-uiPara"

    const childrenSource = view(() => {
      const array: (Node | string)[] = []
      for (const item of this.content()) {
        if (item instanceof UIElement) {
          array.push(item.html())
        } else {
          array.push(item)
        }
      }
      return array
    })

    const childrenTarget = view(
      () => Array.from(p.children).map((x) => x as Node | string),
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

export function uiPara(content: ToGet<UIParaItem[]>): UIElement<"block"> {
  return new UIPara(content)
}
