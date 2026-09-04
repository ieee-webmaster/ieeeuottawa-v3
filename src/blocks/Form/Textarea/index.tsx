import type { FormField, FormValues } from '../types'
import { useFormContext } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Textarea: React.FC<Extract<FormField, { blockType: 'textarea' }>> = ({
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

      <TextAreaComponent id={name} rows={3} {...register(name, { required: Boolean(required) })} />

      {errors[name] && <Error name={name} />}
    </Width>
  )
}
