import { uiClasses } from "../alpha/ui_classes"
import { uiTextBox } from "../alpha/ui_text_box"
import { cell, snapshot } from "../../core"
import type { UIElement } from "../ui_element"
import { uiWrapper } from "../alpha/ui_wrapper"
import { toMem, type ToGet, type ToMem } from "../convert"
import { uiTooltip } from "../alpha/ui_tooltip"

export class ParseError {
  public readonly message: string

  constructor(message: string) {
    this.message = message
  } 
}

///////

class ParsingState {
  public readonly text: string
  public readonly error: string | null

  constructor(text: string, error: string | null) {
    this.text = text
    this.error = error
  }
}

///////

export interface UIParsedTextBoxArgs<T> {
  live?: boolean
  toText: (value: T) => string
  fromText: (text: string) => T | ParseError
  placeholder?: ToGet<string>
  value: ToMem<T>
}

export function uiParsedTextBox<T>(args: UIParsedTextBoxArgs<T>): UIElement<"inline"> {
  const target = toMem(args.value)
  
  const state = cell<ParsingState>(
    snapshot(() => new ParsingState(
      args.toText(target()),
      null
    ))
  )

  const text = (value? : string) => {
    if (value === undefined) {
      return state().text
    } else {
      const parsed = args.fromText(value)
      if (parsed instanceof ParseError) {
        state(new ParsingState(
          value,
          parsed.message
        ))
      } else {
        target(parsed)
        state(new ParsingState(
          value,
          null
        ))
      }
      return value
    }
  }

  const classes = () => [
    state().error === null ? "fluor-valid" : "fluor-invalid",
  ]

  const tooltip = () => state().error ?? ""

  return uiWrapper({
    content: uiTooltip({
      content: uiClasses({
        classes,
        content: uiTextBox({
          live: args.live,
          placeholder: args.placeholder,
          text,
        })
      }),
      tooltip: tooltip,
    }),
    name: "fluor-uiParsedTextBox"
  })
}
