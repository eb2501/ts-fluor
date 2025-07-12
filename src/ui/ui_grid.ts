import type { ToNode } from "../core/page"
import { type Size } from "./common"
import { DomPiece } from "./dom_piece"
import { UIView } from "./ui_view"
import { node, type Node } from "../core/page"

export type GridSize = Size | `${number}fr` | "auto"

class GridDomPiece extends DomPiece {
  constructor(grid: UIGrid) {
    super(grid.id)
    grid.children().forEach(child => this.dynChildren.push(child.id))
    if (grid.columns) {
      this.dynStyleAttrs.push("grid-template-columns", grid.columns())
    }
    if (grid.rows) {
      this.dynStyleAttrs.push("grid-template-rows", grid.rows())
    }
    if (grid.gap) {
      this.dynStyleAttrs.push("gap", grid.gap())
    }
  }

  initHtml(): HTMLElement {
    const html = document.createElement("div")
    html.id = `fluor-id-${this.id}`
    html.classList.add("fluor-grid")
    html.style.display = "grid"
    html.style.alignItems = "stretch"
    html.style.justifyItems = "stretch"
    return html
  }
}

export class UIGrid extends UIView {
  readonly children: Node<UIView[]>
  readonly columns: Node<GridSize> | null
  readonly rows: Node<GridSize> | null
  readonly gap: Node<Size> | null

  constructor(
    children: Node<UIView[]>,
    columns: Node<GridSize> | null,
    rows: Node<GridSize> | null,
    gap: Node<Size> | null
  ) {
    super()
    this.children = children
    this.columns = columns
    this.rows = rows
    this.gap = gap
  }

  private readonly rootPiece = node(() => new GridDomPiece(this))

  collect(pieces: DomPiece[]): void {
    this.children().forEach(child => child.collect(pieces))
    pieces.push(this.rootPiece())
  }
}

///////

export interface UIGridArgs {
  children: ToNode<UIView[]>
  columns?: ToNode<GridSize>
  gap?: ToNode<Size>
  rows?: ToNode<GridSize>
}

export function grid(args: UIGridArgs) {
  return new UIGrid(
    node(args.children),
    args.columns !== undefined ? node(args.columns) : null,
    args.rows !== undefined ? node(args.rows) : null,
    args.gap !== undefined ? node(args.gap) : null
  )
}
