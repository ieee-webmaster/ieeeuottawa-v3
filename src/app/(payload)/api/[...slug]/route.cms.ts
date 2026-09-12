/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { PublishingUnavailable, withProductionEditor } from '@/utilities/staticPublishing'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

const guard =
  (handler: ReturnType<typeof REST_GET>): ReturnType<typeof REST_GET> =>
  async (request, context) => {
    try {
      return await withProductionEditor(() => handler(request, context))
    } catch (error) {
      if (error instanceof PublishingUnavailable)
        return Response.json(
          { errors: [{ message: error.message }] },
          { status: 503, headers: { 'Retry-After': '30' } },
        )
      throw error
    }
  }

export const GET = guard(REST_GET(config))
export const POST = guard(REST_POST(config))
export const DELETE = guard(REST_DELETE(config))
export const PATCH = guard(REST_PATCH(config))
export const PUT = guard(REST_PUT(config))
export const OPTIONS = guard(REST_OPTIONS(config))
