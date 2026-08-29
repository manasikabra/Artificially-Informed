# Artificially Informed

A personal daily AI-intelligence digest: fetches AI news from a curated set of
sources, filters it against a personal curation prompt, and publishes a
static site every morning.

- [`pipeline/`](pipeline) — fetch → filter → cluster → write → assemble. See
  [`pipeline/README.md`](pipeline/README.md).
- [`site/`](site) — Next.js static site that renders the daily editions.
- [`.github/workflows/daily.yml`](.github/workflows/daily.yml) — runs the
  pipeline and redeploys the site every day at 7:00 AM IST.

## One-time repo setup (required for automation to work)

1. **Add the API key secret**: repo Settings → Secrets and variables →
   Actions → New repository secret → name it `ANTHROPIC_API_KEY`, paste your
   Anthropic API key.
2. **Enable GitHub Pages via Actions**: repo Settings → Pages → under "Build
   and deployment", set Source to **GitHub Actions** (not "Deploy from a
   branch").

Once both are done, the `Daily edition` workflow runs automatically every
morning, or can be triggered manually from the Actions tab
(`workflow_dispatch`). The published site will be at
`https://<your-github-username>.github.io/Artificially-Informed/`.

## Local development

```bash
cd pipeline && npm install && cp .env.example .env   # add ANTHROPIC_API_KEY
npm run run                                            # generates today's edition

cd ../site && npm install
npm run dev                                             # http://localhost:3000
```
