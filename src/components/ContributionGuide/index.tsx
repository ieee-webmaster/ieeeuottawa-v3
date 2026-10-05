import Link from 'next/link'
import type { CollectionSlug, ServerProps } from 'payload'

import './index.css'

const contentSections = [
  { slug: 'pages', name: 'Pages', description: 'Homepage and other website pages' },
  { slug: 'posts', name: 'Posts', description: 'News, articles, and announcements' },
  { slug: 'events', name: 'Events', description: 'Event details, dates, and signup links' },
  { slug: 'people', name: 'People', description: 'Names, bios, and profile photos' },
  { slug: 'teams', name: 'Teams', description: 'Team information and descriptions' },
  { slug: 'committee', name: 'Committees', description: 'Executive roles and yearly rosters' },
  { slug: 'media', name: 'Media', description: 'Images and uploaded files' },
  { slug: 'docs', name: 'Docs', description: 'Meeting minutes and document links' },
] as const satisfies { slug: CollectionSlug; name: string; description: string }[]

export default function ContributionGuide({ payload }: Pick<ServerProps, 'payload'>) {
  return (
    <section className="contribution-guide" aria-labelledby="contribution-guide-title">
      <header className="contribution-guide__header">
        <p className="contribution-guide__eyebrow">IEEE uOttawa · Editor guide</p>
        <h1 id="contribution-guide-title">Keep our website up to date.</h1>
        <p>Fix a typo, share an event, or update your team. No coding needed.</p>
      </header>

      <ol className="contribution-guide__steps">
        <li>
          <span className="contribution-guide__number" aria-hidden="true">
            01
          </span>
          <h2>Find your content</h2>
          <p>
            Choose a section in the sidebar or below. Open an existing item to edit it, or choose{' '}
            <strong>Create New</strong> to add one.
          </p>
        </li>
        <li>
          <span className="contribution-guide__number" aria-hidden="true">
            02
          </span>
          <h2>Make your changes</h2>
          <p>
            Edit the fields just like a form. For pages, use the <strong>Content</strong> tab to
            update text, images, and sections. Fill in fields marked with an asterisk (*).
          </p>
        </li>
        <li>
          <span className="contribution-guide__number" aria-hidden="true">
            03
          </span>
          <h2>Review, then publish</h2>
          <p>
            Pages, posts, and events let you <strong>Save Draft</strong> and preview before you{' '}
            <strong>Publish</strong>. In other sections, <strong>Save</strong> applies your changes
            directly.
          </p>
        </li>
      </ol>

      <div className="contribution-guide__details">
        <details>
          <summary>Where should my update go?</summary>
          <dl className="contribution-guide__sections">
            {contentSections.map(({ slug, name, description }) => (
              <div key={slug}>
                <dt>
                  <Link href={`${payload.config.routes.admin}/collections/${slug}`}>{name}</Link>
                </dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </details>
        <details>
          <summary>A quick check before you publish</summary>
          <ul className="contribution-guide__checklist">
            <li>Check spelling, dates, locations, and links.</li>
            <li>
              Use the language selector to review both English and French. Translated fields are
              edited separately; changing one language does not translate the other.
            </li>
            <li>
              Add a short description in the image’s <strong>Alt</strong> field so people using
              screen readers can understand it. Only upload files you have permission to share.
            </li>
            <li>
              Preview pages, posts, and events on desktop and mobile, then check the website after
              publishing. Leave an unfinished item as a draft.
            </li>
          </ul>
        </details>
      </div>

      <footer className="contribution-guide__help">
        <div>
          <h2>Need a hand?</h2>
          <p>
            Can’t edit something, made a mistake, or have an idea? Send the page link and what you’d
            like to change to the webmaster.
          </p>
        </div>
        <a href="mailto:webmaster@ieeeuottawa.ca">
          Contact the webmaster <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </section>
  )
}
