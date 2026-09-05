'use client'

import type { Form, FormBlock as FormBlockProps, FormSubmission } from '@/payload-types'
import { useId, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useRouter } from '@/i18n/navigation'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { getClientSideURL } from '@/utilities/getURL'
import { payloadErrorResponseSchema } from '@/utilities/payloadErrorResponse'
import { RenderFormField } from './fields'
import { getFormDefaultValues, getFormFieldName, type FormValues } from './types'

type Props = Omit<FormBlockProps, 'form'> & { form?: FormBlockProps['form'] | null }

export const FormBlock = (props: Props) => {
  if (!props.form || typeof props.form === 'number') return null
  return <PopulatedFormBlock {...props} form={props.form} />
}

const PopulatedFormBlock = ({
  enableIntro,
  form,
  introContent,
}: Omit<FormBlockProps, 'form'> & { form: Form }) => {
  const { confirmationMessage, confirmationType, redirect, submitButtonLabel } = form
  const instanceID = useId()
  const formID = `form-${form.id}-${instanceID}`
  const formMethods = useForm<FormValues>({
    defaultValues: getFormDefaultValues(form.fields, formID),
  })
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<{ message: string; status?: number }>()
  const router = useRouter()

  const onSubmit = async (values: FormValues) => {
    setError(undefined)
    const loadingTimer = setTimeout(() => setIsLoading(true), 1000)
    try {
      const submissionData: FormSubmission['submissionData'] = (form.fields ?? []).flatMap(
        (field, index) =>
          field.blockType === 'message'
            ? []
            : [
                {
                  field: field.name,
                  value: String(values[getFormFieldName(formID, index)] ?? ''),
                },
              ],
      )
      const response = await fetch(`${getClientSideURL()}/api/form-submissions`, {
        body: JSON.stringify({ form: form.id, submissionData }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) {
        const result = payloadErrorResponseSchema.safeParse(await response.json().catch(() => null))
        setError({
          message: (result.success && result.data.errors[0]?.message) || 'Internal Server Error',
          status: response.status,
        })
        return
      }
      setHasSubmitted(true)
      if (confirmationType === 'redirect' && redirect?.url) router.push(redirect.url)
    } catch {
      setError({ message: 'Something went wrong.' })
    } finally {
      clearTimeout(loadingTimer)
      setIsLoading(false)
    }
  }

  return (
    <div className="container lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 border border-border rounded-[0.8rem]">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && confirmationMessage && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div role="alert">{`${error.status || '500'}: ${error.message}`}</div>}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0">
                {form.fields?.map((field, index) => (
                  <div className="mb-6 last:mb-0" key={field.id ?? index}>
                    <RenderFormField
                      field={
                        field.blockType === 'message'
                          ? field
                          : {
                              ...field,
                              name: getFormFieldName(formID, index),
                            }
                      }
                    />
                  </div>
                ))}
              </div>
              <Button form={formID} type="submit" variant="default" disabled={isSubmitting}>
                {submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
