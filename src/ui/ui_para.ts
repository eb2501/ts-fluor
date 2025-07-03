import { Page, type Cell, type Node } from "../core/page"
import { DomElement } from "./dom_element"
import type { Size } from "./common"
import { UIView } from "./ui_view"


export abstract class UIParaModel extends Page {
    abstract readonly text: Node<string>
    abstract readonly size: Node<Size | null>
}


export class UIParaFreeModel extends UIParaModel {
    readonly text: Cell<string>
    readonly size: Cell<Size | null>
    
    constructor(text: string = "", size: Size | null = null) {
        super()
        this.text = this.cell(text)
        this.size = this.cell(size)
    }
}


export class UIPara<M extends UIParaModel> extends UIView<M> {
    readonly dom = this.node(() => {
        const styles: string[] = []
        const children: string[] = []
        const model = this.model()
        if (model) {
            const size = model.size()
            if (size) {
                styles.push("font-size", size)
            }
            children.push(model.text())
        }
        return new DomElement(
            this.id,
            "p",
            ["fluor-para"],
            null,
            null,
            styles,
            null,
            null,
            children
        )
    })

    collect(doms: DomElement[]): void {
        doms.push(this.dom())
    }
}


export function para(text: string = "", size: Size | null = null): UIPara<UIParaFreeModel> {
    return new UIPara<UIParaFreeModel>(new UIParaFreeModel(text, size))
}