import type { FormField, FormValues } from '../types'
import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
export const Number: React.FC<Extract<FormField, { blockType: 'number' }>> = ({
  name,
  label,
  required,
  width,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>()
  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Input id={name} type="number" {...register(name, { required: Boolean(required) })} />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
