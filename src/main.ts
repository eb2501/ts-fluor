// Vite entry for TypeScript support
import { cell, node } from './core'
import { group } from './ui'
import type { Size } from './ui/common'
import { UIApp } from './ui/ui_app'
import { grid } from './ui/ui_grid'
import { para } from './ui/ui_para'
import { textbox } from './ui/ui_textbox'

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
  ],
})

const app = new UIApp("#app", piece)
