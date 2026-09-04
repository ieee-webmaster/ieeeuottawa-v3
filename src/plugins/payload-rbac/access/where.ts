import type { Access, AccessArgs, Where } from 'payload'

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
  return result
}
