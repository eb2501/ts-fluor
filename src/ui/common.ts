import colorName from 'color-name'

export type Size =
  | `${number}px`
  | `${number}em`
  | `${number}rem`
  | `${number}%`
  | `${number}vw`
  | `${number}vh`
  | `${number}vmin`
  | `${number}vmax`

///////

export type BoxSize =
  | Size
  | `${Size} ${Size}`
  | `${Size} ${Size} ${Size} ${Size}`

///////

export type Color = keyof typeof colorName
