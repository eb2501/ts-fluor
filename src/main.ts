// Vite entry for TypeScript support
import type { Size } from './ui/common'
import { UIApp } from './ui/ui_app'
import { border } from './ui/ui_border'
import { flex } from './ui/ui_flex'
import { UIPara } from './ui/ui_para'

const fontSizes: Size[] = ["15px", "18px", "21px", "23px", "25px"]
const borderWidths: Size[] = ["1px", "2px", "5px", "10px", "20px"]

class MyUIApp extends UIApp {
  readonly counter = this.cell(4)

  readonly fontSize = this.node(() => fontSizes[this.counter() % fontSizes.length])
  readonly borderWidth = this.node(() => borderWidths[this.counter() % borderWidths.length])

  constructor() {
    super("#app")
    this.run(
      flex({
        children: [
          border({
            child: new UIPara({
              text: "Hello from MyUIApp!",
            }),
            style: "solid",
            width: "5px"
          }),
          border({
            child: new UIPara({
              text: "This is a paragraph with dynamic font size.",
            }),
            style: "dashed",
            width: "5px",
          }),
        ],
        justify: "center"
      })
    )
  }
}

const app = new MyUIApp()
// setInterval(() => {
//   if (app.counter() == 1000) {
//     app.run(null)
//     return
//   }
//   app.counter(app.counter() + 1)
// }, 1)

