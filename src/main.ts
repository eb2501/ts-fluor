// Vite entry for TypeScript support
import { cell, node } from './core'
import type { Size } from './ui/common'
import { UIApp } from './ui/ui_app'
import { border } from './ui/ui_border'
import { grid } from './ui/ui_grid'
import { para } from './ui/ui_para'
import { textbox } from './ui/ui_textbox'

const fontSizes: Size[] = ["15px", "18px", "21px", "23px", "25px"]
const borderWidths: Size[] = ["1px", "2px", "5px", "10px", "20px"]

const counter = cell(2)
const fontSize = node(() => fontSizes[counter() % fontSizes.length])
const borderWidth = node(() => borderWidths[counter() % borderWidths.length])

const view = grid({
  children: [
    border({
      child: para({
        text: "Hello from MyUIApp!",
        size: fontSize,
      }),
      style: "solid",
      width: borderWidth
    }),
    textbox({
      value: "Coucou!",
      placeholder: "Type something...",
    }),
    border({
      child: para({
        text: "This is a paragraph with dynamic font size.",
        size: fontSize,
      }),
      style: "dashed",
      width: borderWidth,
    }),
  ],
})

const app = new UIApp("#app")
app.start(view)
// setInterval(() => {
//   if (counter() == 1000) {
//     app.stop()
//     return
//   }
//   counter(counter() + 1)
// }, 100)
