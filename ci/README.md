# CI workflow

`github-actions-ci.yml` is the CI pipeline for this repo. It is parked here
rather than at `.github/workflows/ci.yml` because the GitHub App used to push
this branch does not hold the `workflows` permission, so any push that creates
or edits a file under `.github/workflows/` is rejected outright.

## Activating it

Move it into place and push from your own account:

```bash
mkdir -p .github/workflows
git mv ci/github-actions-ci.yml .github/workflows/ci.yml
git rm ci/README.md
git commit -m "ci: enable GitHub Actions"
git push
```

The workflow then runs on every push and pull request.

## What it checks

| Step | Command |
|---|---|
| Install | `npm ci --ignore-scripts` |
| Prisma client | `npx prisma generate` |
| Lint | `npx eslint .` |
| Types | `npx tsc --noEmit` |
| Tests | `npm test` |
| Build | `npx next build` |

`postinstall` is skipped during install so that a failure to download the
Prisma engine binaries shows up as its own red step rather than as a confusing
install error.

The build step sets throwaway `DATABASE_URL`, `JWT_SECRET` and `CRON_SECRET`
values. They are not secrets and are not used to reach anything real — they
exist because `lib/auth/jwt.ts` throws at import time when `JWT_SECRET` is
missing, and `next build` evaluates that module while collecting page data.

## Running the same checks locally

```bash
npm test          # 132 unit tests, no database required
npm run lint
npx tsc --noEmit
```
