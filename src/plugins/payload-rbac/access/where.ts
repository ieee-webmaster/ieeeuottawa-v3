import type { Access, AccessArgs, Where } from 'payload'

import { isRecord } from './identity'

const whereOperatorKeys = new Set(['and', 'or'])

export const isWhere = (value: unknown): value is Where => {
  if (!isRecord(value)) return false
  for (const key of Object.keys(value)) {
    if (whereOperatorKeys.has(key)) return true
    const inner = (value as Record<string, unknown>)[key]
    if (isRecord(inner)) return true
  }
  return false
}

export const combineWhere = (base: Where | null, extra: Where | null): Where | null => {
  if (base && extra) {
    return {
      and: [base, extra],
    }
  }

  return base ?? extra
}

export const resolveBaseAccess = async (
  access: Access | undefined,
  args: AccessArgs,
): Promise<boolean | Where> => {
  if (!access) {
    return true
  }

  const result = await access(args)
  return result as boolean | Where
}
