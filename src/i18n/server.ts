import 'server-only'

import { cookies } from 'next/headers'

import { defaultLocale, isLocale, localeCookieName, type AppLocale } from './config'

export const getRequestLocale = async (): Promise<AppLocale> => {
  const cookieStore = await cookies()
  const candidate = cookieStore.get(localeCookieName)?.value
  return isLocale(candidate) ? candidate : defaultLocale
}
