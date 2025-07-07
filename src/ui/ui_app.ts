import type { UIView } from "./ui_view";
import type { DomElement } from "./dom_element";
import { Page } from "../core/page";
import invariant from "tiny-invariant";

export abstract class UIApp extends Page {
  private readonly anchor: HTMLElement
  private readonly mapping: Map<number, [DomElement, HTMLElement]> = new Map()
  private handle: number | null = null
  private root = this.cell<UIView | null>(null)
  
  private readonly doms = this.node(() => {
    const result: DomElement[] = []
    this.root()?.collect(result)
    return result
  })

  private readonly attached = this.node(() => {
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
    super()
    const anchor = document.getElementById(id);
    if (!anchor) {
      throw new Error(`Element with id [${id}] not found`)
    }
    this.anchor = anchor
    this.doms.addListener((cached) => this.listen(cached))
    this.update()
  }

  run(root: UIView | null): void {
    this.root(root)
  }

  private listen(cached: boolean): void {
    if (this.handle === null && !cached) {
      this.handle = window.setTimeout(() => this.update(), 0)
    }
  }

  private update(): void {
    invariant(this.mapping !== null, "UIApp not initialized")
    const newIds = new Set<number>()
    const oldIds = new Set<number>(this.mapping.keys())
    for (const newDom of this.doms()) {
      newIds.add(newDom.id)
      if (this.mapping.has(newDom.id)) {
        const [oldDom, _] = this.mapping.get(newDom.id)!
        if (newDom !== oldDom) {
          const html = newDom.update(this.mapping)
          this.mapping.set(newDom.id, [newDom, html])
        }
      } else {
        const html = newDom.create(this.mapping)
        this.mapping.set(newDom.id, [newDom, html])
      }
    }
    for (const oldId of oldIds) {
      if (!newIds.has(oldId)) {
        this.mapping.delete(oldId)
      }
    }
    this.attached()
    this.handle = null
  }
}
