# Wave 1 Frozen Build

Frozen at: 2026-09-04 (JST)

## Build identity

- Frozen branch: `wave1-2026-09-04`
- Frozen commit: `414b13abc54b87df6840d4e1115bd7502a5fae03`
- Participant set: `P001`–`P020`
- Assignment: exact 10 AB / 10 BA
- Distribution target: `https://nemifi.github.io/mystery-prince/`

## Validation completed before freeze

- Experience Contract validation: PASS
- Realization compilation: PASS
- Runtime-v1 auto-play: PASS
- Prototype static validation: PASS
- Blind-build validation: PASS
- Participant-link operational validation: PASS
- Result-analysis self-test: PASS
- Participant-link generator self-test: PASS
- Browser smoke AB: PASS
- Browser smoke BA: PASS
- Two-stage blind → reveal debrief: PASS
- Participant-scoped storage/export: PASS
- Distinct A/B ROLE portraits: PASS

## Distribution state

`BLOCKED_ON_PAGES_ENABLEMENT`

The GitHub Actions deployment workflow is correct and has `pages: write` + `id-token: write`, but the repository does not yet have a GitHub Pages site. `actions/configure-pages` cannot create the site through the connected GitHub App because GitHub returns `Resource not accessible by integration` for the administrative create-site operation.

Required one-time repository-owner action:

1. GitHub repository → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Re-run **Deploy concept prototype**
4. Smoke-test `https://nemifi.github.io/mystery-prince/?pid=P000&order=AB&reset=1`
5. Only after that succeeds, change P001–P020 distribution status to `READY`

## Freeze rule

Do not change prototype story, character presentation, mystery logic, debrief wording, or assignment order during Wave 1 except for a genuine blocking defect. If a blocking defect requires a prototype change, record a new frozen commit before continuing recruitment.
