import type { FormField, FormValues } from '../types'
import { Controller, useFormContext } from 'react-hook-form'
import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Error } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<Extract<FormField, { blockType: 'checkbox' }>> = ({
  name,
  label,
  required,
  width,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>()
  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <Controller
          name={name}
          control={control}
          rules={{ required: Boolean(required) }}
          render={({ field: { value, onChange, ...field } }) => (
            <CheckboxUi
              {...field}
              id={name}
              checked={value === true}
              onCheckedChange={(checked) => onChange(checked === true)}
            />
          )}
        />
        <Label htmlFor={name}>
          {required && (
            <span className="required">
              * <span className="sr-only">(required)</span>
            </span>
          )}
          {label}
        </Label>
      </div>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
