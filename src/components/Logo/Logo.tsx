import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  invert?: boolean
}

export const Logo = ({ className, priority = false, loading, invert = false }: Props) => {
  return (
    <div className={clsx('relative w-[9.375rem] shrink-0', className)}>
      <Image
        src="/ieeelogo_dark.svg"
        alt="IEEE Logo"
        width={193 * 1.5}
        height={34 * 1.5}
        priority={priority}
        loading={loading}
        className={clsx('h-auto w-full', invert ? 'hidden dark:block' : 'block dark:hidden')}
      />

      <Image
        src="/ieeelogo_light.svg"
        alt="IEEE Logo"
        width={193 * 1.5}
        height={34 * 1.5}
        priority={priority}
        loading={loading}
        className={clsx('h-auto w-full', invert ? 'block dark:hidden' : 'hidden dark:block')}
      />
    </div>
  )
}
