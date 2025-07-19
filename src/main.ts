// Vite entry for TypeScript support
import { cell } from './core'
import { group } from './ui'
import { UIApp } from './ui/ui_app'
import { grid } from './ui/ui_grid'
import { para } from './ui/ui_para'
import { radioButton } from './ui/ui_radiobtn'
import { textbox } from './ui/ui_textbox'

const selected = cell(true)

const piece = grid({
  items: [
    [
      para({
        text: "Hello from MyUIApp!",
      })
    ],
    [
      group({
        content: textbox({
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
        text: "Straight",
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
        text: "Inverted",
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
  ],
})

const app = new UIApp("#app", piece)
