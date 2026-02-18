import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  priority?: boolean
}

export const Logo = ({ className, priority = false }: Props) => {
  return (
    <Image
      src="/ieeelogo_gradient.svg"
      alt="IEEE Logo"
      width={193 * 1.5}
      height={34 * 1.5}
      priority={priority}
      className={clsx('max-w-[9.375rem] w-full h-auto', className)}
    />
  )
}
