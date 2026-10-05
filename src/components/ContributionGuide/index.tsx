import { Collapsible } from '@payloadcms/ui'
import Link from 'next/link'
import type { CollectionSlug, ServerProps } from 'payload'

import './index.css'

export default function ContributionGuide({ payload }: Pick<ServerProps, 'payload'>) {
  const collectionURL = (slug: CollectionSlug) =>
    `${payload.config.routes.admin}/collections/${slug}`

  return (
    <section className="contribution-guide" aria-labelledby="contribution-guide-title">
      <h2 id="contribution-guide-title">Contribution guidelines</h2>
      <p>
        Website content is edited here, without code. Open a guide below for the change you want to
        make.
      </p>

      <Collapsible header="Edit text or images on a page" initCollapsed>
        <ol>
          <li>
            Open <Link href={collectionURL('pages')}>Pages</Link> and select the page’s title.
          </li>
          <li>
            Use the <strong>Hero</strong> tab for the banner at the top of the page. Use the{' '}
            <strong>Content</strong> tab for the rest of the page: expand a section to edit its
            text, links, or images.
          </li>
          <li>
            In an image field, select an existing image or upload one. Add a short description in
            the image’s <strong>Alt</strong> field for people using screen readers.
          </li>
          <li>
            Changes are saved automatically as a draft. Preview the page, including the mobile view,
            then choose <strong>Publish changes</strong> when it is ready to appear on the website.
            Leaving it as a draft keeps your edits off the live site.
          </li>
        </ol>
        <p>
          Keep an existing page’s <strong>Slug</strong> unchanged unless you intend to change its
          web address. Changing it can break links to that page.
        </p>
      </Collapsible>

      <Collapsible header="Publish news or an event" initCollapsed>
        <ol>
          <li>
            Open <Link href={collectionURL('posts')}>Posts</Link> for news or{' '}
            <Link href={collectionURL('events')}>Events</Link> for an event. Choose{' '}
            <strong>Create New</strong>, or select an existing title to update it.
          </li>
          <li>
            Enter a title and write the details in the <strong>Content</strong> tab. For events,
            also fill in <strong>Date</strong>, <strong>Location</strong>, and{' '}
            <strong>Hosted By</strong> (the organizing team). Add a <strong>Signup Link</strong> if
            registration is required.
          </li>
          <li>
            Your edits are saved automatically as a draft. Preview the item, check dates and links,
            then choose <strong>Publish changes</strong>. You can leave it as a draft if it is not
            ready yet.
          </li>
        </ol>
      </Collapsible>

      <Collapsible header="Update a person, position, or committee" initCollapsed>
        <ul>
          <li>
            <Link href={collectionURL('people')}>People</Link>: open a person to change their{' '}
            <strong>Full Name</strong>, <strong>Headshot</strong>, or{' '}
            <strong>Linkedin Profile</strong>. Create the person here before adding them to a
            committee.
          </li>
          <li>
            <Link href={collectionURL('teams')}>Teams</Link>: open a team and expand{' '}
            <strong>Positions</strong> to edit a <strong>Position Title</strong> or{' '}
            <strong>Position Email</strong>.
          </li>
          <li>
            <Link href={collectionURL('committee')}>Committees</Link>: select the correct{' '}
            <strong>Year</strong>, expand the team under <strong>Teams</strong>, then edit{' '}
            <strong>Members</strong>. Each member needs a <strong>Position Title</strong> and a{' '}
            <strong>Person</strong>. To change who holds a role, update the Person here.
          </li>
        </ul>
        <p>
          These sections do not have drafts. <strong>Save</strong> applies changes directly to the
          website, so check the selected year and person first.
        </p>
      </Collapsible>

      <Collapsible header="Add meeting minutes or a document" initCollapsed>
        <ol>
          <li>
            Open <Link href={collectionURL('docs')}>Docs</Link> and select the academic year.
          </li>
          <li>
            Add an entry under <strong>Meeting Minutes</strong>, <strong>General Documents</strong>,
            or <strong>Other Documents</strong>. Enter its name and paste the document’s sharing
            link into <strong>Google Docs Url</strong>. For minutes, include the meeting date.
          </li>
          <li>
            Check that visitors can open the document without requesting access, then choose{' '}
            <strong>Save</strong>. These changes appear directly on the website.
          </li>
        </ol>
      </Collapsible>

      <p>
        <strong>English and French:</strong> review both languages using the selector at the top
        before publishing. Translations are edited separately; changing English text does not update
        the French version.
      </p>
      <p>
        Can’t edit an item or need help correcting a mistake? Email{' '}
        <a href="mailto:webmaster@ieeeuottawa.ca">webmaster@ieeeuottawa.ca</a> with the page link
        and the change you need.
      </p>
    </section>
  )
}
