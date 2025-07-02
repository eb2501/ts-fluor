import { Page } from "../core/page";
import type { DomElement } from "./dom_element";
import { newId } from "./id_gen";

export abstract class UIElement extends Page {
    readonly id: number

    constructor() {
        super();
        this.id = newId()
    }

    abstract collect(doms: DomElement[]): void
}
