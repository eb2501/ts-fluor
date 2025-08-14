import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement } from "../ui_element"

class UIPara extends UIBlockElement {
  private readonly content: Get<UIElement<"inline">[]>

  constructor(content: Get<UIElement<"inline">[]>) {
    super()
    this.content = content
  }

  readonly html = node(() => {
    const p = document.createElement("p")
    p.className = "fluor-uiPara"

    const childrenSource = () => {
      const array: Node[] = []
      for (const item of this.content()) {
        array.push(item.html())
      }
      return array
    }

    const childrenTarget = (value?: Node[]) => {
      if (value === undefined) {
        return Array.from(p.children)
      } else {
        p.replaceChildren(...value)
        return value
      }
    }

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

export interface UIParaArgs {
  content: ToGet<UIElement<"inline">[]>
}

export function uiPara(args: UIParaArgs): UIBlockElement {
  return new UIPara(toGet(args.content))
}
