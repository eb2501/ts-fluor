import { cell, node, once, view, type Get, type Mem } from "../../core"
import { UIComponent } from "../elements/ui_component"
import validator from "validator"
import type { UILabelTargetMixin } from "../elements/ui_label"
import { toGet, toMem, type ToGet, type ToMem } from "../convert"
import type { UIElement } from "../ui_element"
import { uiTextBox } from "../elements/ui_text_box"
import { uiTooltip } from "../elements/ui_tooltip"
import { uiClasses } from "../elements/ui_classes"

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
  private readonly value: Mem<T>
  private readonly toText: (value: T) => string
  private readonly fromText: (text: string) => T | ParseError
  private readonly live?: boolean
  private readonly placeholder?: Get<string>

  constructor(
    value: ToMem<T>,
    toText: (value: T) => string,
    fromText: (text: string) => T | ParseError,
    live?: boolean,
    placeholder?: ToGet<string>,
  ) {
    super("uiParsedTextBox")
    this.value = toMem(value)
    this.toText = toText
    this.fromText = fromText
    this.live = live
    this.placeholder = placeholder ? toGet(placeholder) : undefined
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

  private readonly textBox = once(() => uiTextBox({
    live: this.live,
    placeholder: this.placeholder,
    text: this.text,
  }))

  readonly element = once(() => uiTooltip({
    content: uiClasses({
      content: this.textBox(),
      classes: this.classes,
    }),
    text: this.tooltip,
  }))

  readonly valid = view(() => this.unparsed() === null)

  readonly id = once(() => this.textBox().id())
}

///////

export function uiParsedTextBox<T>({
  value,
  toText,
  fromText,
  live,
  placeholder,
}: {
  value: ToMem<T>
  toText: (value: T) => string,
  fromText: (text: string) => T | ParseError,
  live?: boolean,
  placeholder?: ToGet<string>,
}): UIElement<"inline"> & UILabelTargetMixin & UIValidMixin {
  return new UIParsedTextBox(value, toText, fromText, live, placeholder)
}

///////

function textToNumber(text: string): number | ParseError {
  if (!validator.isFloat(text.trim())) {
    return new ParseError("Invalid number")
  }
  return parseFloat(text)
}

export function uiNumberTextBox({
  value,
  live,
  placeholder,
}: {
  value: ToMem<number>,
  live?: boolean,
  placeholder?: ToGet<string>,
}) {
  return uiParsedTextBox({
    value,
    toText: (value) => value.toString(),
    fromText: textToNumber,
    live,
    placeholder,
  })
}
