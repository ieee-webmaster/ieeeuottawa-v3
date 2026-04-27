# IEEE uOttawa v3 ⚙️

This is the official website of the IEEE uOttawa Student Branch. It serves as a platform to share news, events, and resources with our members and the wider community. The site is built using Payload CMS, Next.js, Tailwind CSS, ShadCn, and deployed serverlessly on Vercel.

> _NOTE: This project is based on [Payload's website builder template](https://vercel.com/templates/next.js/payload-website-starter). The original unmodified README instructions can be found [here](./docs/PAYLOAD_TEMPLATE.md)._

## General info 📌

- The [repository](https://github.com/ieee-webmaster/ieeeuottawa-v3) is owned by the IEEE uOttawa Webmaster account ([@ieee-webmaster](https://github.com/ieee-webmaster)). _This is done to get the free Vercel plan for the project._ The current webmaster is the official maintainer of the project and holds authority over the repo, but anyone is welcome to contribute. If you would like to contribute, please read the [contribution guidelines](#contribution-guidelines-external) and then submit a pull request with your changes.
- To make changes to the content of the production website, use the Payload admin panel https://ieeeuottawa-v3.vercel.app/admin. Since we are using a CMS (Content Management System), there is no need to make content changes through code. **Caution: any changes made here will be reflected on the live website immediately, so please ensure that you have the proper permissions and that you are making intentional changes.**
- The website is [deployed serverless on Vercel](https://vercel.com/ieee-uottawa-webmaster/ieeeuottawa-v3). Only the webmaster account has modification permissions, but any contributor can view deployments and their logs. Please reach out to the webmaster if you would like to be added as a viewer to the project on Vercel.
- In production, Payload uses Neon (a Postgres-based cloud database) to store all of the content for the website, and Vercel Blob Storage to store all of the media assets. Both of these services are integrated into Vercel and were automatically set up when the project was deployed. **Please ensure a proper backup exists before making any destructive changes to the production database or blob storage, as data loss can occur.**
- For local development, every developer can run their own instance of the database using Docker. This creates a distinct environment where changes won't affect what is currently deployed. Setup instructions are explained in [Getting Started](#getting-started).

## Useful links 🔗

Github:

- Repository: https://github.com/ieee-webmaster/ieeeuottawa-v3
- Project board: https://github.com/users/ieee-webmaster/projects/1

Vercel:

- Dashboard: https://ieeeuottawa-v3.vercel.app
- Deployments: https://vercel.com/ieee-uottawa-webmaster/ieeeuottawa-v3/deployments
- Storage: https://vercel.com/ieee-uottawa-webmaster/ieeeuottawa-v3/storage

Admin:

- Payload admin panel (production): https://ieeeuottawa-v3.vercel.app/admin
- Neon console (production database): https://console.neon.tech/app/projects/wild-butterfly-74995532

Contact:

- Webmaster email: webmaster@ieeeuottawa.ca
- Chair email: chair@ieeeuottawa.ca
- IEEE uOttawa Discord: https://discord.gg/tu9GXtxBgZ
- Payload discord: https://discord.com/invite/payload
- View the [Contributors List](docs/humans.md)

## Development 🛠️

### Prequisites

1. [Node.js](https://nodejs.org/en/download) (v18 or higher)
2. [Docker](https://www.docker.com/get-started) to run a local instance of the Postgres database
3. [Pnpm](https://pnpm.io/installation) - like npm but better. `npm install -g pnpm`

### Getting started

1. First clone the repo if you have not done so already.

```bash
git clone https://github.com/ieee-webmaster/ieeeuottawa-v3.git
```

&nbsp;<br> 2. Set up your environment. `cp .env.example .env` to copy the example environment variables. You'll need to edit:
`POSTGRES_URL`: Set `<your-local-db-name>` to the db name in [docker-compose.yml](./docker-compose.yml)
`PAYLOAD_SECRET`: Set `<your-payload-secret>` to a long random string
`PREVIEW_SECRET`: Set `<your-preview-secret>` to a long random string
<br>

3. Start a local instance of the Postgres database using Docker.

```bash
docker-compose up
```

   <br>

4. In another terminal, install dependencies and start the dev server.

```bash
pnpm install && pnpm dev
```

&nbsp;<br> 5. open `http://localhost:3000` to open the app in your browser.

That's it! Changes made in `./src` will be reflected in your app. Create an admin user for your local instance and visit `http://localhost:3000/admin` to access the admin panel. To seed the database with a few pages, posts, and projects you can click the 'seed database' link from the admin panel.

> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data. ⚠️

## Contribution guidelines

We welcome contributions from anyone! If you would like to contribute, please follow these guidelines:

### Conventional commits

To keep our commit history clean and organized, we follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This means that all commit messages should be formatted as `<type>: <description>`

Where `<type>` is one of the following:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

```bash
Example:
feat: add new events page with calendar integration
```

### External contributions

If you are not part of the team but would like to contribute, please follow these guidelines:

1. Fork the repository and create a new branch for your feature or bug fix.
2. Make your changes and ensure that they are well-documented and tested.
3. Submit a pull request with a clear description of your changes and why they are needed.

A member of the IEEE uOttawa team will review your pull request and provide feedback or merge it if it meets the project's standards!

### Credit

We credit all contributors to the project in the [humans file](./docs/humans.md). If you would like to be credited for your contributions, please make sure to add your name and GitHub profile to the humans file.

## Important Docs 📚

As mentionned above, the original unmodified README instructions can be found in [/docs/PAYLOAD_TEMPLATE.md](./docs/PAYLOAD_TEMPLATE.md). Below are some important sections of the documentation that are relevant to this project, alonside some notes from the maintainer team.

### Collections

Collections are used to manage different types of content in your CMS. The template comes pre-configured collections such as Posts and Pages, but we've extended it to include the data structures needed for the ieee website. These include People, Events, Docs, Committees, Teams, and more. Each collection has its own set of fields and configurations that are used to manage the content for that collection. To learn more about how to create and configure collections, see the [Payload Collections](https://payloadcms.com/docs/configuration/collections) docs.

### Layout Builder

Every page on the website is built using the layout builder, which is a powerful tool that allows you to create custom page layouts using pre-designed blocks. The template comes pre-configured with a set of layout building blocks such as Archive and Call to Action, but we've extended it to include custom blocks that are used to create the unique layouts for the ieee website. These include Accordion, Card Grid, Gallery, Logo Grid, Quick Links, and more. Each block is fully designed and built into the front-end website that comes with this template. See the [Layout Builder docs](https://payloadcms.com/docs/layout-builder/overview) for more details on how to use the layout builder and create custom blocks.

### Live preview

You can enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

### SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

### Working with Postgres

Postgres and other SQL-based databases follow a strict schema for managing your data. In comparison to non-relational databases, this means that there's a few extra steps to working with Postgres.

Note that often times when making big schema changes you can run the risk of losing data if you're not manually migrating it.

### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) are essentially SQL code versions that keeps track of your schema. When deploy with Postgres you will need to make sure you create and then run your migrations.

```bash
pnpm payload migrate:create
```

This creates the migration files you will need to push alongside with your new schema changes. This is what tells the production database how to update its schema without losing data.

```bash
pnpm payload migrate
```

This is the command that is ran in production on Vercel after every push. It checks for any new migrations that have not yet been run and runs them. This is what updates the production database schema to match your new code changes. It ran on the production database when you push to the main branch.

> _WARNING: Migrations are a pain in the ass to work with. Please be careful as they can easily corrupt the production database if done incorrectly. Only run migrations if you know what you're doing. ⚠️_

### Sync

When you pull new code that contains schema changes, your local database needs to know what to do with them. You might be prompted in your terminal to select `create column`, or `rename column`, and this can easily create a mess in your environment. If you're familiar with the changes, you can follow the prompts and update your local database's schema this way. If not, the easiest solution is to delete the volume for your local database in Docker. This just means that the next time you launch your app you'll need to re-create a user login and re-seed the db, but it's better than corrupting your database.

In production, it's not as easy. When you have existing data, you can't always just **delete everyting**. This is where proper management of migrations comes in. It's also common practice to squash migrations every once in a while. This means that you delete all the old migration files and create a new migration file that contains the SQL code for the current state of the schema. This way, when you pull new code, there's only one migration file to run instead of a long chain of them.

### Backups

In order to avoid having to redo everything from scratch in the event of data loss, we create database backups every 3 days, apply them to a backup database (useful for a quick fix), and store snapshots as encrypted artifacts containing SQL files that can reconstruct the state of the database at the time of the snapshot. This is all done through a single GitHub Actions script, [`database-backup.yml`](./.github/workflows/database-backup.yml).

Only the webmaster can recover snapshots. GitHub Actions only has access to the public key, which is enough to encrypt new backups but not enough to read old ones.

For more context about backups, you can read this PR: [Database backups](https://github.com/ieee-webmaster/ieeeuottawa-v3/pull/48)

### Internationalization / Localization

We use [`next-intl`](https://next-intl.dev/) to implement localization (`l10n`) and internationalization (`i18n`). All website content must be available in both English and French. Any content added to the CMS must be translated into both languages (unless intentionally non-localized, such as brand names) and entered in the appropriate language view using the language switcher in the top-right corner of the admin panel. For static content (for example, section titles and subtitles), use the dedicated language files: [French](/messages/fr.json) and [English](/messages/en.json).

## Questions ❓

If you have any issues or questions, reach out to the Webmaster at webmaster@ieeeuottawa.ca or the IEEE uOttawa team. See our [useful links](#useful-links) for other ressources. 😸
