import { cell } from './core'
import { uiGroup } from './ui'
import { UIApp } from './ui/ui_app'
import { uiCheckBox } from './ui/alpha/ui_check_box'
import { uiGrid } from './ui/alpha/ui_grid'
import { uiH1 } from './ui/alpha/ui_heading'
import { uiPara } from './ui/alpha/ui_para'
import { uiRadioButton } from './ui/alpha/ui_radio_btn'
import { uiTextBox } from './ui/alpha/ui_text_box'

import { uiNumberTextBox } from './ui/beta/ui_parsed_tb'
import { uiText } from './ui/alpha/ui_text'
import { View } from './example/temperature'

const selected = cell(true)

const value = cell(10)

const item1 = uiH1('Title!')
const item2 = uiPara([uiText("Hello from MyUIApp!")])
const item3 = uiGroup(
  uiPara([
    uiTextBox(
      false,
      "Type something...",
      "",
    ),
    uiRadioButton(
      "radio",
      (value?: boolean) => {
        if (value === undefined) {
          return selected()
        } else {
          selected(value)
          return value
        }
      }
    ),
    uiRadioButton(
      "radio",
      (value?: boolean) => {
        if (value === undefined) {
          return !selected()
        } else {
          selected(!value)
          return !value
        }
      }
    ),
    uiCheckBox(selected),
    uiNumberTextBox(
      true,
      "Enter a number",
      value
    )
  ]),
  "Group!",
)

const allItems = [
  item1,
  item2,
  item3,
]

const piece = uiGrid(
  allItems,
  allItems.map(() => "auto"),
  ["auto"],
)

const _ = new UIApp("#app", piece)

// const _ = new UIApp("#app", new View())
