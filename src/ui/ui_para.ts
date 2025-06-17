import { Page, type CellC } from "../core/page"
import { UIView } from "./ui_view"
import { DomTree } from "./dom_tree"

export type UITextSize =
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "9xl"

function renderTextSize(size: UITextSize): string {
    switch (size) {
        case "xs": return "text-xs"
        case "sm": return "text-sm"
        case "base": return "text-base"
        case "lg": return "text-lg"
        case "xl": return "text-xl"
        case "2xl": return "text-2xl"
        case "3xl": return "text-3xl"
        case "4xl": return "text-4xl"
        case "5xl": return "text-5xl"
        case "6xl": return "text-6xl"
        case "7xl": return "text-7xl"
        case "8xl": return "text-8xl"
        case "9xl": return "text-9xl"
        default:
            throw new Error(`Unknown text size: ${size}`)
    }
}

export interface UIParaModel {
    text(): string
    size(): UITextSize
}

export class UIParaState extends Page implements UIParaModel {
    readonly text: CellC<string>
    readonly size: CellC<UITextSize>

    constructor(text: string = "", size: UITextSize = "base") {
        super()
        this.text = this.cell(text)
        this.size = this.cell(size)
    }
}

export class UIPara<M extends UIParaModel> extends UIView<M> {
    readonly tree = this.node(() => 
        new DomTree(
            "p",
            [
                "class", renderTextSize(this.model().size())
            ],
            [
                this.model().text()
            ]
        )
    )
}

export function para(text: string = "", size: UITextSize = "base"): UIPara<UIParaState> {
    return new UIPara(new UIParaState(text, size))
}
