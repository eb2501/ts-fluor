import { UIElement, UIMonoContentElement, type UIType } from "../ui_element"
import { node, type Get, attach, OneWayPipe } from "../../core"
import { toGet, type ToGet } from "../convert"

class UIClasses<T extends UIType> extends UIMonoContentElement<T> {
  private readonly classes: Get<string[]>

  constructor(content: UIElement<T>, classes: Get<string[]>) {
    super(content)
    this.classes = classes
  }

  readonly html = node(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)

    const classesSource = () => ["fluor-uiClasses", ...this.classes()]

    const classesTarget = (value?: string[]) => {
      if (value === undefined) {
        return Array.from(html.classList)
      } else {
        html.className = value.join(" ")
        return value
      }
    }

    attach(
      html,
      new OneWayPipe(
        classesSource,
        classesTarget
      )
    )

    html.appendChild(this.content.html())
    return html
  })
}

///////

export function uiClasses<T extends UIType>(
  content: UIElement<T>,
  classes: ToGet<string[]>
): UIElement<T> {
  return new UIClasses(
    content,
    toGet(classes)
  )
}
