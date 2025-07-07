// Vite entry for TypeScript support
import { UIApp } from './ui/ui_app'
import { UIPara } from './ui/ui_para'

const fontSizes = ["15px", "18px", "21px", "23px", "25px"]

class MyUIApp extends UIApp {
  readonly size = this.cell(fontSizes[0])

  constructor() {
    super("#app")
    this.run(new UIPara({
      text: "Hello from MyUIApp!",
      size: this.size
    }))
  }
}

const app = new MyUIApp()

let counter = 0
setInterval(() => {
  if (counter == 1000) {
    app.run(null)
    return
  }
  const idx = (counter++) % fontSizes.length;
  app.size(fontSizes[idx]);
}, 1);

