export type AutoOrder = 'asc' | 'desc'

export type ResolvedLeafLink = {
  href: string
  label: string
  newTab?: boolean
}

export type ResolvedLinkRow = ResolvedLeafLink & {
  id?: string | null
  kind: 'link'
}

export type ResolvedDropdownRow = {
  id?: string | null
  kind: 'dropdown'
  label: string
  items: ResolvedLeafLink[]
}

export type ResolvedNavItem = ResolvedLinkRow | ResolvedDropdownRow

export type NavigationPluginOptions = {
  collections: string[]
  globals: string[]
}
