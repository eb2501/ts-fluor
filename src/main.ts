// Vite entry for TypeScript support
import { cell } from './core'
import { group } from './ui'
import { UIApp } from './ui/ui_app'
import { checkBox } from './ui/ui_checkbox'
import { grid } from './ui/ui_grid'
import { h1 } from './ui/ui_heading'
import { para } from './ui/ui_para'
import { radioButton } from './ui/ui_radiobtn'
import { textBox } from './ui/ui_textbox'

const selected = cell(true)

const piece = grid({
  items: [
    [
      h1('Title!')
    ],
    [
      para({
        text: "Hello from MyUIApp!",
      })
    ],
    [
      group({
        content: textBox({
          value: "",
          placeholder: "Type something...",
        }),
        legend: "Group!",
      })
    ],
    [
      para({
        text: "This is a paragraph with dynamic font size.",
      })
    ],
    [
      radioButton({
        group: "radio",
        checked: (value?: boolean) => {
          if (value === undefined) {
            return selected()
          } else {
            selected(value)
            return value
          }
        }
      })
    ],
    [
      radioButton({
        group: "radio",
        checked: (value?: boolean) => {
          if (value === undefined) {
            return !selected()
          } else {
            selected(!value)
            return value
          }
        }
      })
    ],
    [
      checkBox({
        checked: selected
      })
    ]
  ],
})

const app = new UIApp("#app", piece)
