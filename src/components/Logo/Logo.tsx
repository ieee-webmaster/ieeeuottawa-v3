import clsx from 'clsx'
import Image from 'next/image'

interface Props {
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  invert?: boolean
  tone?: 'adaptive' | 'dark' | 'light'
}

export const Logo = ({
  className,
  priority = false,
  loading,
  invert = false,
  tone = 'adaptive',
}: Props) => {
  const darkLogoClass =
    tone === 'dark'
      ? 'block'
      : tone === 'light'
        ? 'hidden'
        : invert
          ? 'hidden dark:block'
          : 'block dark:hidden'
  const lightLogoClass =
    tone === 'light'
      ? 'block'
      : tone === 'dark'
        ? 'hidden'
        : invert
          ? 'block dark:hidden'
          : 'hidden dark:block'

  return (
    <div className={clsx('relative w-[9.375rem] shrink-0', className)}>
      <Image
        src="/ieeelogo_dark.svg"
        alt="IEEE Logo"
        width={193 * 1.5}
        height={34 * 1.5}
        priority={priority}
        loading={loading}
        className={clsx('h-auto w-full', darkLogoClass)}
      />

      <Image
        src="/ieeelogo_light.svg"
        alt="IEEE Logo"
        width={193 * 1.5}
        height={34 * 1.5}
        priority={priority}
        loading={loading}
        className={clsx('h-auto w-full', lightLogoClass)}
      />
    </div>
  )
}
