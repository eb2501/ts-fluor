import { cell, isGet, isMem, once, type Get, type Mem } from "../core"
import { uiPara } from "./alpha/ui_para"
import { uiText } from "./alpha/ui_text"
import { isBlock, isInline, UIElement } from "./ui_element"

export type ToGet<T> = Get<T> | T

export function toGet<T>(arg: ToGet<T>): Get<T> {
  if (isGet(arg)) {
    return arg
  } else {
    return once(() => arg)
  }
}

///////

export type ToMem<T> = Mem<T> | T

export function toMem<T>(arg: ToMem<T>): Mem<T> {
  if (isMem(arg)) {
    return arg
  } else {
    return cell(arg)
  }
}

///////

export type ToInline = UIElement<"inline"> | string

export function toInline(value: ToInline): UIElement<"inline"> {
  if (isInline(value)) {
    return value
  } else {
    return uiText(value)
  }
}

///////

export type ToBlock = UIElement<"block"> | ToInline

export function toBlock(value: ToBlock): UIElement<"block"> {
  if (isBlock(value)) {
    return value
  } else {
    return uiPara([toInline(value)])
  }
}
