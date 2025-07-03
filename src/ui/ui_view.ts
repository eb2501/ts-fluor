import { Page, type Cell } from "../core/page";
import type { DomElement } from "./dom_element";
import { newId } from "./id_gen";

export abstract class UIView<M> extends Page {
    readonly id: number
    readonly model: Cell<M | null>

    constructor(model: M | null = null) {
        super()
        this.id = newId()
        this.model = this.cell(model)
    }

    abstract collect(doms: DomElement[]): void
}
