import type { UIView } from "./ui_view"
import type { DomPiece } from "./dom_piece"
import { node, cell } from "../core/page"
import invariant from "tiny-invariant"


export class UIApp {
  private readonly anchor: HTMLElement
  private readonly mapping: Map<number, [DomPiece, HTMLElement]> = new Map()
  private readonly root = cell<UIView | null>(null)
  private handle: number | null = null
  
  private readonly pieces = node(() => {
    const pieces: DomPiece[] = []
    this.root()?.collect(pieces)
    return pieces
  })

  private readonly attached = node(() => {
    const root = this.root()
    if (root === null) {
      this.anchor.replaceChildren()
      return false
    } else {
      invariant(this.mapping.has(root.id), "Root element must be in mapping")
      const [_, html] = this.mapping.get(root.id)!
      this.anchor.replaceChildren(html)
    }
  })

  constructor(id: string) {
    const anchor = document.getElementById(id)
    if (!anchor) {
      throw new Error(`Element with id [${id}] not found`)
    }
    this.anchor = anchor
    this.pieces.addListener((cached) => this.listen(cached))
    this.update()
  }

  start(root: UIView): void {
    this.root(root)
  }

  stop() {
    this.root(null)
  }

  private listen(cached: boolean): void {
    if (this.handle === null && !cached) {
      this.handle = window.setTimeout(() => this.update(), 0)
    }
  }

  private resolve(id: number): HTMLElement {
    const couple = this.mapping.get(id)
    invariant(couple, `No piece found for id [${id}]`)
    return couple[1]
  }

  private update(): void {
    invariant(this.mapping !== null, "UIApp not initialized")
    const newIds = new Set<number>()
    const oldIds = new Set<number>(this.mapping.keys())
    for (const newPiece of this.pieces()) {
      newIds.add(newPiece.id)
      if (this.mapping.has(newPiece.id)) {
        const [oldPiece, oldHtml] = this.mapping.get(newPiece.id)!
        if (newPiece !== oldPiece) {
          newPiece.updateHtml((id) => this.resolve(id), oldPiece, oldHtml)
          this.mapping.set(newPiece.id, [newPiece, oldHtml])
        }
      } else {
        const newHtml = newPiece.initHtml()
        newPiece.buildHtml((id) => this.resolve(id), newHtml)
        this.mapping.set(newPiece.id, [newPiece, newHtml])
      }
    }
    for (const oldId of oldIds) {
      if (!newIds.has(oldId)) {
        const [oldPiece, oldHtml] = this.mapping.get(oldId)!
        oldPiece.freeHtml(oldHtml)
        this.mapping.delete(oldId)
      }
    }
    this.attached()
    this.handle = null
  }
}
