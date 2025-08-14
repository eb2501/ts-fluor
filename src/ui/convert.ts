import { cell, type Get, type Mem, isGet, isMem } from "../core"
import { uiPara } from "./alpha/ui_para"
import { uiText } from "./alpha/ui_text"
import { isBlock, isInline, UIElement } from "./ui_element"

export type ToGet<T> = T | Get<T> | Mem<T>
export type ToMem<T> = T | Mem<T>

///////

export function toGet<T>(value: ToGet<T>): Get<T> {
  if (isGet(value) || isMem(value)) {
    return value
  } else {
    return () => value
  }
}

export function toMem<T>(value: ToMem<T>): Mem<T> {
  if (isMem(value)) {
    return value
  } else {
    return cell(value)
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
