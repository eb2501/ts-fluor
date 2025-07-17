import type { UIPiece } from "./ui_piece"
import invariant from "tiny-invariant"
import type { Ticket } from "../core/ticket"
import type { Assembler } from "./assembler"
import type { Listener } from "../core/cache"


class Payload {
  readonly version: number
  readonly html: HTMLElement

  constructor(version: number, html: HTMLElement) {
    this.version = version
    this.html = html
  }
}

///////

class DomAssembler implements Assembler<HTMLElement> {
  private readonly mapping: Map<UIPiece, Payload>

  constructor(mapping: Map<UIPiece, Payload>) {
    this.mapping = mapping
  }

  child(piece: UIPiece): HTMLElement {
    return this.mapping.get(piece)!.html
  }
  
  text(text: string): HTMLElement {
    const textNode = document.createTextNode(text)
    return textNode as unknown as HTMLElement
  }

  node(
    tag: string,
    attrs: Record<string, string>,
    children: HTMLElement[]
  ): HTMLElement {
    const html = document.createElement(tag)
    for (const [key, value] of Object.entries(attrs)) {
      html.setAttribute(key, value)
    }
    html.replaceChildren(...children)
    return html
  }
}

///////

export class UIApp implements Ticket {
  private readonly anchor: HTMLElement
  private payloads: Map<UIPiece, Payload> = new Map()
  private root: UIPiece | null = null
  private readonly listener: Listener
  private handle: number | null = null
  
  constructor(id: string, root: UIPiece) {
    const anchor = document.getElementById(id)
    if (!anchor) {
      throw new Error(`Element with id [${id}] not found`)
    }
    this.anchor = anchor
    this.root = root
    this.listener = (cached: boolean) => {
      if (this.handle === null && !cached) {
        this.handle = window.setTimeout(() => this.update(), 0)
      }
    }
    root.globalVersion.addListener(this.listener)
    this.update()
    const payload = this.payloads.get(root)!
    this.anchor.replaceChildren(payload.html)
  }

  burn() {
    invariant(this.root !== null, "Already burned")
    this.root.globalVersion.removeListener(this.listener)
    if (this.handle !== null) {
      window.clearTimeout(this.handle)
      this.handle = null
    }
    for (const [piece, payload] of this.payloads) {
      piece.detach(payload.html)
    }
    this.payloads.clear()
    this.anchor.replaceChildren()
    this.root = null
  }

  private build(
    payloads: Map<UIPiece, Payload>,
    assembler: DomAssembler,
    piece: UIPiece
  ) {
    for (const child of piece.children()) {
      this.build(payloads, assembler, child)
    }
    let payload = this.payloads.get(piece)
    if (!payload || payload.version !== piece.localVersion()) {
      if (payload) {
        piece.detach(payload.html)
      }
      const html = piece.render(assembler)
      piece.attach(html)
      if (payload) {
        payload.html.replaceWith(html)
      }
      payload = new Payload(
        piece.localVersion(),
        html
      )
    }
    payloads.set(piece, payload)
  }

  private update(): void {
    invariant(this.root !== null)
    const payloads: Map<UIPiece, Payload> = new Map()
    this.build(
      payloads,
      new DomAssembler(payloads),
      this.root
    )
    for (const [piece, payload] of this.payloads) {
      if (!payloads.has(piece)) {
        piece.detach(payload.html)
      }
    }
    this.payloads = payloads
  }
}
