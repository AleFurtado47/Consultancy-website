# Consultancy website

`alefurtado.org` — hand-written HTML, no build step, no framework.

## How this publishes, in one line

**Netlify serves the repository root.** Push to `main` and the root of this repo becomes the live site.

Pinned in [`netlify.toml`](netlify.toml) so the setting lives in the repo rather than only in the Netlify UI.

## The rule that has already cost one production 404

Anything Netlify has to read as configuration goes at the **repo root**, in the publish directory. That means `_redirects`, and it would mean `_headers` or `robots.txt` if they are ever added.

There used to be a `deploy/` folder that several handovers described as "what Netlify publishes". It never was. Nothing in it was ever served as the site, and `deploy/_redirects` was never read. Two things hid this for months:

1. The `deploy/` copy was kept byte-identical to the root copy, so the pages looked right either way.
2. **Netlify resolves `.html` automatically.** `/method` and `/card` worked with no rule behind them, which made the redirects file look functional. `/index` still returns 200 today and has never had a rule.

The first URL that genuinely required a redirect was `/product-sheet`, and it 404'd in production on 13 August 2026. `deploy/` was removed in the same clean-up; it is recoverable from history at `672291c` if ever needed.

**To re-derive any of this yourself:** fetch `/print-card.html`. It exists only at the repo root, and it serves.

## Layout

| Path | What |
|---|---|
| `index.html` | home page |
| `method.html` | the Delivery Readiness Review method page |
| `card.html`, `print-card.html` | digital and printable contact cards |
| `assets/` | video, posters, portrait, partner logos, the product sheet PDF |
| `_redirects` | Netlify rules. Root only. |
| `netlify.toml` | pins the publish directory |

## Local preview

Do not open `index.html` over `file://`. The hero film fails to load, its `error` handler strips the `herofilm` class, and the page silently falls back to the older drawn-line hero, which looks exactly like a regression and is not one.

Serve it over HTTP instead, using the `site` configuration in `.claude/launch.json`.

## Before pushing

- `git add --dry-run -A` and confirm `assets/delivery-readiness-review.pdf` is listed. `.gitignore` excludes `*.pdf` to keep private documents out of the repo, and a single negation lets that one file through. `git status` alone will not warn you if it is being excluded.
- Check the page still draws six connectors: `document.querySelectorAll('#thread path').length === 6`. The connector script throws if a selector it reads has moved, and a `Promise.all` swallows the exception, so every connector on the page disappears at once rather than just the one that broke.
- Measure horizontal overflow at 320, 390, 768 and 1280. This check has caught three real defects that looking at the page did not.
- After deploying, fetch the changed URLs rather than trusting the build log.
