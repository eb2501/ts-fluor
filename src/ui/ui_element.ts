import invariant from "tiny-invariant";
import { Page, type NodeC } from "../core/page";
import { type DomTree } from "./dom_tree"

let nextVersion = 0

export abstract class UIElement extends Page {
    abstract readonly tree: NodeC<DomTree>

    readonly children = this.node(() => {
        const children: UIElement[] = []
        this.tree().collect(children)
        return children
    })

    readonly version = this.node(() => {
        this.tree()
        return nextVersion++
    })

    readonly _visible = this.cell(false)
    readonly visible = this.node(() => this._visible())

    onShow(): void {
        invariant(!this._visible(), "UIElement is already visible")
        this._visible.set(true)
    }

    onHide(): void {
        invariant(this._visible(), "UIElement is not visible")
        this._visible.set(false)
    }
}
