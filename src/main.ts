import { cell, view } from './core'
import { UIApp } from './ui/ui_app'

import { uiNumberTextBox } from './ui/beta/ui_parsed_tb'
import { View } from './example/temperature'
import { uiH1 } from './ui/alpha/ui_heading'
import { uiPara } from './ui/alpha/ui_para'
import { uiGroup } from './ui/alpha/ui_group'
import { uiTextBox } from './ui/alpha/ui_text_box'
import { uiRadioButton } from './ui/alpha/ui_radio_btn'
import { uiCheckBox } from './ui/alpha/ui_check_box'
import { uiGrid } from './ui/alpha/ui_grid'
import { uiFlex } from './ui/alpha/ui_flex'

const selected = cell(true)

const value = cell(10)

const item1 = uiH1('Title!')
const item2 = uiPara(["Hello from MyUIApp!"])
const item3 = uiGroup(
  uiFlex({
    content:     [
      uiPara([
        uiTextBox(
          false,
          "Type something...",
          cell(""),
        )
      ]),
      uiPara([
        uiRadioButton(
          "radio",
          selected,
        ),
        uiRadioButton(
          "radio",
          view(
            () => !selected(),
            (value) => selected(!value)
          )
        ),
      ]),
      uiPara([
        uiCheckBox(selected)
      ]),
      uiPara([
        uiNumberTextBox(
          true,
          "Enter a number",
          value
        )
      ])
    ],
    dir: "column",
    justify: "center",
    align: "stretch",
  }),
  "Group!",
)

const allItems = [
  item1,
  item2,
  item3,
]

const piece = uiFlex({
  content: allItems,
  dir: "column",
  justify: "space-between",
  align: "center",
})

const _ = new UIApp("#app", piece)

// const _ = new UIApp("#app", new View())
