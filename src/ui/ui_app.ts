import type { Ticket } from "../core/ticket";
import type { UIView } from "./ui_view";
import type { DomElement } from "./dom_element";
import { Page } from "../core/page";

export class UIApp extends Page implements Ticket {
  private readonly anchor: HTMLElement
  private readonly root: UIView<any>
  private mapping: Map<number, [DomElement, HTMLElement]> = new Map()
  private handle: number | null = null;

  private readonly doms = this.node(() => {
    const result: DomElement[] = []
    this.root.collect(result)
    return result
  })

  constructor(id: string, root: UIView<any>) {
    super()
    const anchor = document.getElementById(id);
    if (!anchor) {
      throw new Error(`Element with id [${id}] not found`)
    }
    this.anchor = anchor
    this.root = root
    this.doms.addListener((cached) => this.listen(cached))
    this.refresh()
    const [_, html] = this.mapping.get(root.id)!
    anchor.replaceChildren(html)
  }

  private listen(cached: boolean): void {
    if (this.handle === null && !cached) {
      this.handle = window.setTimeout(() => this.refresh(), 0)
    }
  }

  private refresh(): void {
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
    this.handle = null
  }

  burn(): void {
    this.mapping.clear()
    this.anchor.replaceChildren()
    this.doms.removeListener(this.listen)
    if (this.handle !== null) {
      window.clearTimeout(this.handle)
      this.handle = null
    }
  }
}
