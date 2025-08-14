import { type Get, attach, node, OneWayPipe } from "../../core"
import { type Size } from "../common"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement } from "../ui_element"

export type GridSize = Size | `${number}fr` | "auto"

class UIGrid extends UIBlockElement {
  private readonly items: Get<UIElement<"block">[][]>
  private readonly rows: Get<GridSize[]>
  private readonly columns: Get<GridSize[]>
  private readonly gap: Get<Size>

  constructor(
    items: Get<UIElement<"block">[][]>,
    rows: Get<GridSize[]>,
    columns: Get<GridSize[]>,
    gap: Get<Size>,
  ) {
    super()
    this.items = items
    this.rows = rows
    this.columns = columns
    this.gap = gap
  }

  readonly html = node(() => {
    const div = document.createElement("div")
    div.className = "fluor-grid"
    div.style.display = "grid"

    //
    // Rows
    //

    const rowsTarget = (value? : string[]) => {
      if (value === undefined) {
        return Array.from(div.style.gridTemplateRows.split(" "))
      } else {
        div.style.gridTemplateRows = value.join(" ")
        return value
      }
    }

    attach(
      div,
      new OneWayPipe(
        this.rows,
        rowsTarget,
      )
    )

    //
    // Columns
    //

    const columnsTarget = (value? : string[]) => {
      if (value === undefined) {
        return Array.from(div.style.gridTemplateColumns.split(" "))
      } else {
        div.style.gridTemplateColumns = value.join(" ")
        return value
      }
    }

    attach(
      div,
      new OneWayPipe(
        this.columns,
        columnsTarget,
      )
    )

    //
    // Gap
    //

    const gapTarget = (value? : string) => {
      if (value === undefined) {
        return div.style.gap
      } else {
        div.style.gap = value
        return value
      }
    }

    attach(
      div,
      new OneWayPipe(
        this.gap,
        gapTarget,
      )
    )

    //
    // Items
    //

    const childrenSource = () =>
      this.items().flatMap(row => row.map(item => item.html()))

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
        childrenTarget,
      )
    )

    return div
  })
}

///////

export interface UIGridArgs {
  items: ToGet<UIElement<"block">[][]>
  rows: ToGet<GridSize[]>
  columns: ToGet<GridSize[]>
  gap: ToGet<Size>
}

export function uiGrid(args: UIGridArgs): UIElement<"block"> {
  return new UIGrid(
    toGet(args.items),
    toGet(args.rows),
    toGet(args.columns),
    toGet(args.gap)
  )
}
