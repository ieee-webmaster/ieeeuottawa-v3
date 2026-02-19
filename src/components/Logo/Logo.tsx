import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
}

export const Logo = ({ className, priority = false, loading }: Props) => {
  return (
    <div className={clsx('w-[9.375rem] h-auto relative', className)}>
      <Image
        src="/ieeelogo_light.svg"
        alt="IEEE Logo"
        width={193 * 1.5}
        height={34 * 1.5}
        priority={priority}
        loading={loading}
        className="block dark:hidden"
      />

      <Image
        src="/ieeelogo_dark.svg"
        alt="IEEE Logo"
        width={193 * 1.5}
        height={34 * 1.5}
        priority={priority}
        loading={loading}
        className="hidden dark:block"
      />
    </div>
  )
}
