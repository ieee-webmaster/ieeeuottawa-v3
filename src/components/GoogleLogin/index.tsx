import { Button } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import { googleOAuthEnabled } from '@/auth/google'

export default function GoogleLogin({ initPageResult, searchParams }: AdminViewServerProps) {
  if (initPageResult.req.user) redirect('/admin')

  return (
    <div>
      <h1>IEEE uOttawa</h1>
      <p>Sign in with your @ieeeuottawa.ca Google account to access the dashboard.</p>
      {searchParams?.googleError && (
        <p role="alert">Sign-in failed. Use your IEEE Google account and try again.</p>
      )}
      {googleOAuthEnabled() ? (
        <Button el="anchor" url="/api/users/oauth/google">
          Sign in with Google
        </Button>
      ) : (
        <p>Google sign-in is not configured yet. Please contact the webmaster.</p>
      )}
    </div>
  )
}
