import { once } from "../../core"
import { type Size } from "../common"
import { UIBlockElement, UIElement, type UIType } from "../ui_element"

export type GridSize = Size | `${number}fr` | "auto"

class UIGrid extends UIBlockElement {
  private readonly content: UIElement<UIType>[]
  private readonly rows: GridSize[]
  private readonly columns: GridSize[]

  constructor(
    content: UIElement<UIType>[],
    rows: GridSize[],
    columns: GridSize[],
  ) {
    super()
    this.content = content
    this.rows = rows
    this.columns = columns
  }

  readonly html = once(() => {
    const div = document.createElement("div")
    div.className = `fluor-uiGrid`
    div.style.display = "grid"
    div.style.gridTemplateRows = this.rows.join(" ")
    div.style.gridTemplateColumns = this.columns.join(" ")
    div.replaceChildren(...this.content.map(c => c.html()))
    return div
  })
}

///////

export function uiGrid({
  content,
  rows,
  columns
}: {
  content: UIElement<UIType>[],
  rows: GridSize[],
  columns: GridSize[],
}): UIElement<"block"> {
  return new UIGrid(content, rows, columns)
}
