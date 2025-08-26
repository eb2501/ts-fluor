import { UIElement, type UIType } from "../ui_element"
import { type Get, attach, OneWayPipe, once, view } from "../../core"
import { toGet, type ToGet } from "../convert"

class UIClasses<T extends UIType> extends UIElement<T> {
  private readonly content: UIElement<T>
  private readonly classes: Get<string[]>

  constructor(content: UIElement<T>, classes: ToGet<string[]>) {
    super()
    this.content = content
    this.classes = toGet(classes)
  }

  readonly type = once(() => this.content.type())

  readonly html = once(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)

    const classesSource = view(() => [
      "fluor-uiClasses", ...this.classes()
    ])

    const classesTarget = view(
      () => Array.from(html.classList),
      (value) => html.className = value.join(" ")
    )

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

export function uiClasses<T extends UIType>({
  content,
  classes
}: {
  content: UIElement<T>,
  classes: ToGet<string[]>
}): UIElement<T> {
  return new UIClasses(content, classes)
}
