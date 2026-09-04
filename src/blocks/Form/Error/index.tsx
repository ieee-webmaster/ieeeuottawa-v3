'use client'

import { useFormContext } from 'react-hook-form'
import type { FormValues } from '../types'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext<FormValues>()
  return (
    <div className="mt-2 text-red-500 text-sm">
      {errors[name]?.message || 'This field is required'}
    </div>
  )
}
