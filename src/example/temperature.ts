
//
// Defining the Model
//

import { node, cell, once, view } from "../core"
import { uiCheckBox } from "../ui/alpha/ui_check_box"
import { UIComponent } from "../ui/alpha/ui_component"
import { uiGrid } from "../ui/alpha/ui_grid"
import { uiPara } from "../ui/alpha/ui_para"
import { uiNumberTextBox } from "../ui/beta/ui_parsed_tb"

export type TemperatureUnit = 'celsius' | 'fahrenheit'
  
export class Model {
  readonly sourceValue = cell(0)
  readonly sourceUnit = cell<TemperatureUnit>('celsius')
  readonly targetValue = node(() => {
    if (this.sourceUnit() === 'celsius') {
      return (this.sourceValue() * 9) / 5 + 32
    } else {
      return ((this.sourceValue() - 32) * 5) / 9
    }
  })
  readonly targetUnit = node(() => {
    return this.sourceUnit() === 'celsius' ? 'fahrenheit' : 'celsius'
  })
}

//
// Defining the View
//

export class View extends UIComponent<"block"> {

  constructor() {
    super("View")
  }

  readonly model = cell<Model>(new Model())

  private readonly inputPart = once(() => uiNumberTextBox(
    true,
    "Enter temperature",
    view(
      () => this.model().sourceValue(),
      (value) => this.model().sourceValue(value)
    )
  ))

  private readonly leftPart = once(() => uiPara(
    [this.inputPart()]
  ))

  private readonly celsiusPart = once(() => uiCheckBox(
    view(
      () => this.model().sourceUnit() === 'celsius',
      (value) => this.model().sourceUnit(value ? 'celsius' : 'fahrenheit')
    )
  ))

  private readonly fahrenheitPart = once(() => uiCheckBox(
    view(
      () => this.model().sourceUnit() === 'fahrenheit',
      (value) => this.model().sourceUnit(value ? 'fahrenheit' : 'celsius')
    )
  ))

  private readonly selectPart = once(() => uiGrid(
    [
      uiPara([this.celsiusPart()]),
      uiPara(["Celsius"]),
      uiPara([this.fahrenheitPart()]),
      uiPara(["Fahrenheit"])
    ],
    ["auto", "auto"],
    ["auto", "auto"],
  ))

  private readonly outputText = node(() => {
    if (this.inputPart().valid()) {
      const valueText = Math.round(this.model().targetValue()).toString()
      return `= ${valueText} ${this.model().targetUnit()}`
    } else {
      return "= ?"
    }
  })

  private readonly outputPart = once(() => uiPara(
    view(() => [this.outputText()]),
  ))

  readonly element = once(() => uiGrid(
    [
      this.leftPart(),
      this.selectPart(),
      this.outputPart()
    ],
    ["auto"],
    ["auto", "auto", "auto"],
  ))
}
