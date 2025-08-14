
//
// Defining the Model
//

import { node } from "../core"
import { cell } from "../core/cell"
import { uiCheckBox } from "../ui/alpha/ui_check_box"
import { UIComponent } from "../ui/alpha/ui_component"
import { uiGrid } from "../ui/alpha/ui_grid"
import { uiPara } from "../ui/alpha/ui_para"
import { uiText } from "../ui/alpha/ui_text"
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

  private readonly inputPart = node(() => uiNumberTextBox(
    true,
    "Enter temperature",
    node(() => this.model().sourceValue())
  ))

  private readonly leftPart = node(() => uiPara(
    [this.inputPart()]
  ))

  private readonly celsiusChecked = (value?: boolean) => {
    if (value === undefined) {
      return this.model().sourceUnit() === 'celsius'
    } else {
      this.model().sourceUnit(value ? 'celsius' : 'fahrenheit')
      return value
    }
  }

  private readonly celsiusPart = node(() => uiCheckBox(
    this.celsiusChecked,
  ))

  private readonly fahrenheitChecked = (value?: boolean) => {
    if (value === undefined) {
      return this.model().sourceUnit() === 'fahrenheit'
    } else {
      this.model().sourceUnit(value ? 'fahrenheit' : 'celsius')
      return value
    }
  }

  private readonly fahrenheitPart = node(() => uiCheckBox(
    this.fahrenheitChecked
  ))

  private readonly selectPart = node(() => uiGrid(
    [
      uiPara([this.celsiusPart()]),
      uiPara([uiText("Celsius")]),
      uiPara([this.fahrenheitPart()]),
      uiPara([uiText("Fahrenheit")])
    ],
    ["auto", "auto"],
    ["auto", "auto"],
  ))

  private readonly outputText = node(() => {
    if (this.inputPart().valid()) {
      const valueText = this.model().targetValue().toString()
      return `= ${valueText} ${this.model().targetUnit()}`
    } else {
      return "= ?"
    }
  })

  private readonly outputPart = node(() => uiPara(
    [uiText(this.outputText())]
  ))

  readonly element = node(() => uiGrid(
    [
      this.leftPart(),
      this.selectPart(),
      this.outputPart()
    ],
    ["auto"],
    ["auto", "auto", "auto"],
  ))
}
