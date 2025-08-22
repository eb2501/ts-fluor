import { cell, node, once, view, type Get, type Mem } from "../../core"
import { UIComponent } from "../alpha/ui_component"
import validator from "validator"
import type { UILabelTargetMixin } from "../alpha/ui_label"
import { toGet, toMem, type ToGet, type ToMem } from "../convert"
import type { UIElement } from "../ui_element"
import { uiTextBox } from "../alpha/ui_text_box"
import { uiTooltip } from "../alpha/ui_tooltip"
import { uiClasses } from "../alpha/ui_classes"

export class ParseError {
  public readonly message: string

  constructor(message: string) {
    this.message = message
  } 
}

///////

class Unparsed {
  public readonly text: string
  public readonly error: string

  constructor(text: string, error: string) {
    this.text = text
    this.error = error
  }
}

///////

export interface UIValidMixin {
  readonly valid: Get<boolean>
}

///////

class UIParsedTextBox<T>
  extends UIComponent<"inline">
  implements UILabelTargetMixin, UIValidMixin
{
  private readonly live: boolean
  private readonly placeholder: Get<string>
  private readonly toText: (value: T) => string
  private readonly fromText: (text: string) => T | ParseError
  private readonly value: Mem<T>

  constructor(
    live: boolean,
    placeholder: ToGet<string>,
    toText: (value: T) => string,
    fromText: (text: string) => T | ParseError,
    value: ToMem<T>
  ) {
    super("uiParsedTextBox")
    this.live = live
    this.placeholder = toGet(placeholder)
    this.toText = toText
    this.fromText = fromText
    this.value = toMem(value)
  }

  private readonly unparsed = cell<Unparsed | null>(null)
  private readonly parsed = node(() => this.toText(this.value()))
  private readonly text = view(
    () => {
      const unparsed = this.unparsed()
      if (unparsed !== null) {
        return unparsed.text
      } else {
        return this.parsed()
      }
    },
    (value) => {
      const parsed = this.fromText(value)
      if (parsed instanceof ParseError) {
        this.unparsed(new Unparsed(value, parsed.message))
      } else {
        this.unparsed(null)
        this.value(parsed)
      }
      return value
    }
  )

  private readonly classes = view(() => [
    this.unparsed() === null ? "fluor-valid" : "fluor-invalid",
  ])

  private readonly tooltip = view(() => this.unparsed()?.error ?? "")

  private readonly textBox = once(() => uiTextBox(
    this.live,
    this.placeholder,
    this.text,
  ))

  readonly element = once(() => uiTooltip(
    uiClasses(
      this.textBox(),
      this.classes,
    ),
    this.tooltip,
  ))

  readonly valid = view(() => this.unparsed() === null)

  readonly id = once(() => this.textBox().id())
}

///////

export function uiParsedTextBox<T>(
  live: boolean,
  placeholder: ToGet<string>,
  toText: (value: T) => string,
  fromText: (text: string) => T | ParseError,
  value: ToMem<T>
): UIElement<"inline"> & UILabelTargetMixin & UIValidMixin {
  return new UIParsedTextBox(live, placeholder, toText, fromText, value)
}

///////

function textToNumber(text: string): number | ParseError {
  if (!validator.isFloat(text.trim())) {
    return new ParseError("Invalid number")
  }
  return parseFloat(text)
}

export function uiNumberTextBox(
  live: boolean,
  placeholder: ToGet<string>,
  value: ToMem<number>
) {
  return uiParsedTextBox(
    live,
    placeholder,
    (value) => value.toString(),
    textToNumber,
    value
  )
}
