# Nautikos (By Manjunath Moncy Gopalan)

## Description

I've been working on a new project called Nautikos which is a platform for job
candidates to apply for jobs and to help connect vetted candidates with vetted
companies. The platform is built on top of AWS and Remix (https://remix.run)

## Demo URL

https://dev.shippingjobs.ae/

Login credentials:

Job Candidate

Email: <fatima@gmail.com> Password: hellowolf122!

## Prequisities

- [Node 20 or later](https://github.com/nvm-sh/nvm)
- [PNPM](https://pnpm.io/installation#prerequisites)
- [SST v3](https://sst.dev/)

## For MVP Ventures Team

Put this in your `~/.aws/config` file:

```sh
################################################################################
# MVP Ventures SSO
################################################################################

[sso-session mvp-ventures]
sso_start_url = https://[your-name].awsapps.com/start
sso_region = ap-south-1

[profile mvp-ventures-development]
sso_session = mvp-ventures
sso_account_id =
sso_role_name = AdministratorAccess

[profile mvp-ventures-production]
sso_session = mvp-ventures
sso_account_id =
sso_role_name = AdministratorAccess
```

## Set up a local development environment

- Git clone this repo
- Install dependencies using PNPM:

```sh
pnpm install
```

Verify that SST is installed:

```sh
pnpm sst version
```

- Login to AWS account with `pnpm sso`

```sh
pnpm sso
```

- Set up secrets (contact us for the values) for your local development
  environment and AWS resources using SST for your local environment:

```sh
pnpm sst secret set DatabaseUrl [DATABASE_URL]
pnpm sst secret set ResendApiKey [RESEND_API_KEY]
pnpm sst deploy
pnpm sst secret list
```

- Run this in root:

```sh
pnpm sst dev
```

Verify that the app is running at `http://localhost:5173`.

## Database seeding

To seed the database, run:

```sh
cd packages/core
pnpm db:seed
pnpm db:seed:countries
pnpm db:seed:companies
pnpm db:seed:membership-bodies

```

## Tear down a local development environment

This will tear down AWS resources for your local development environment only.

```sh
pnpm sst remove
```
