import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Doc } from '@/payload-types'

type DocItem = {
  name: string
  description?: string
  fileUrl: string
}

type DocsType = {
  year: string
  generalDocuments?: DocItem[]
  meetingMinutes?: (DocItem & { meetingDate?: string })[]
  otherDocuments?: DocItem[]
}
