import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement } from "../ui_element"

class UIParaElement extends UIBlockElement {
  private readonly content: Get<(string | UIElement<"inline">)[]>

  constructor(content: Get<(string | UIElement<"inline">)[]>) {
    super()
    this.content = content
  }

  readonly html = node(() => {
    const p = document.createElement("p")
    p.className = "fluor-uiPara"

    const childrenSource = () => {
      const array: Node[] = []
      for (const item of this.content()) {
        if (typeof item === "string") {
          const textNode = document.createTextNode(item)
          array.push(textNode)
        } else {
          array.push(item.html())
        }
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
  content: ToGet<(string | UIElement<"inline">)[]>
}

export function uiPara(args: UIParaArgs): UIBlockElement {
  return new UIParaElement(toGet(args.content))
}
