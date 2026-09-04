import type { FormField, FormValues } from '../types'
import { countryOptions } from '../Country/options'
import { stateOptions } from '../State/options'

import { Label } from '@/components/ui/label'
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'

export const Select: React.FC<Extract<FormField, { blockType: 'select' | 'country' | 'state' }>> = (
  props,
) => {
  const { name, label, required, width } = props
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>()
  const options =
    props.blockType === 'country'
      ? countryOptions
      : props.blockType === 'state'
        ? stateOptions
        : (props.options ?? [])
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
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = options.find((t) => t.value === value)

          return (
            <SelectComponent onValueChange={onChange} value={controlledValue?.value}>
              <SelectTrigger className="w-full" id={name}>
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </SelectComponent>
          )
        }}
        rules={{ required: Boolean(required) }}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
