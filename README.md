# Environment setup

Choose a profile and copy it to the root `.env` before starting the project.
`.env.dev` and `.env.docker` are templates; edit credentials in your local `.env`.

Local development (apps and PostgreSQL on the host):

```sh
cp .env.dev .env
npm run db:migrate --workspace=@repo/database
npm run dev
```

Run the application services in Docker with PostgreSQL on the host:

```sh
cp .env.docker .env
docker compose up -d --build
```

The copy commands replace the current `.env`. Dev connects to `localhost`;
Docker connects to PostgreSQL at `host.docker.internal:5432` and the API at
`api:8000`. The API and web load `.env` through `env_file`. API and web keep their image-specific ports (8000 and
3000); do not add a shared `PORT` variable to these profiles.

Start PostgreSQL on your machine and create the `security` database before running
the apps or migrations. Set the database credentials and port in `DATABASE_URL`.
On Docker Desktop for Mac, containers reach the host via `host.docker.internal`;
PostgreSQL must accept connections from Docker. Compose does not create or manage
PostgreSQL or a database volume.

Next.js embeds API rewrites during its build, so Compose also passes the
non-secret `BACKEND_URL` as a web build argument. Rebuild the web image when
changing that URL. `BETTER_AUTH_URL` and CORS origins remain browser-facing URLs.
Compose runs the API, web and Nginx reverse proxy. Run database migrations on the host with
`npm run db:migrate --workspace=@repo/database` using the local development env
before switching to `.env.docker`.

## Single public URL through Nginx

Docker serves the app at `http://localhost:8080`. Set `NGINX_PORT` in `.env` to
change the published port. Nginx forwards `/api` and `/api/*` (including auth) to
`api:8000`, and all other paths to `web:3000`. The API and web use `expose` only;
they have no published host ports. WebSockets and streamed responses are supported.

When changing the public domain or port, also update `BETTER_AUTH_URL`,
`BACKEND_ORIGIN` and `BACKEND_CORS_ORIGINS` to that public origin, then recreate
containers with `docker compose up -d`. Keep `BACKEND_URL=http://api:8000` for
internal server calls. This configuration serves HTTP; HTTPS requires TLS setup.
Local development continues to use the direct app ports from `.env.dev`.

# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared across applications
- `@repo/configs`: unified configuration package containing global runtime config, TypeScript presets, and ESLint configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo build
npm exec turbo build
npm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
npm exec turbo build --filter=docs
npm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
npm exec turbo dev
npm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
npm exec turbo dev --filter=web
npm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
npm exec turbo login
npm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
npm exec turbo link
npm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)

# mini-security
