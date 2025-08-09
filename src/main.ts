import { cell } from './core'
import { uiGroup } from './ui'
import { UIApp } from './ui/ui_app'
import { uiCheckBox } from './ui/alpha/ui_check_box'
import { uiGrid } from './ui/alpha/ui_grid'
import { uiH1 } from './ui/alpha/ui_heading'
import { uiPara } from './ui/alpha/ui_para'
import { uiRadioButton } from './ui/alpha/ui_radio_btn'
import { uiTextBox } from './ui/alpha/ui_text_box'

import validator from 'validator'
import { ParseError, uiParsedTextBox } from './ui/beta/ui_parsed_tb'

const selected = cell(true)

function textToNumber(text: string): number | ParseError {
  if (!validator.isFloat(text.trim())) {
    return new ParseError("Invalid number")
  }
  return parseFloat(text)
}

const value = cell(10)

const item1 = uiH1('Title!')
const item2 = uiPara({
  content: ["Hello from MyUIApp!"],
})
const item3 = uiGroup({
  content: uiPara({
    content: [
      uiTextBox({
        text: "",
        placeholder: "Type something...",
      }),
      uiRadioButton({
        group: "radio",
        checked: (value?: boolean) => {
          if (value === undefined) {
            return selected()
          } else {
            selected(value)
            return value
          }
        }
      }),
      uiRadioButton({
        group: "radio",
        checked: (value?: boolean) => {
          if (value === undefined) {
            return !selected()
          } else {
            selected(!value)
            return !value
          }
        }
      }),
      uiCheckBox({
        checked: selected
      }),
      uiParsedTextBox({
        value: value,
        toText: (value: number) => value.toString(),
        fromText: textToNumber,
        placeholder: "Enter a number",
        live: true,
      })
    ],
  }),
  legend: "Group!",
})

const allItems = [
  item1,
  item2,
  item3,
]

const piece = uiGrid({
  items: allItems.map(x => [x]),
  gap: "10px",
  columns: ["auto"],
  rows: allItems.map(() => "auto"),
})

const _ = new UIApp("#app", piece)
