# Contributing

Keep each change focused and runnable. Install with `npm ci`, then run `npm test`, `npm run typecheck` and `npm run format:check`.

For rendering changes, generate the fictional source with `npm run sample`, render the relevant example into a new folder, inspect its technical report and watch the entire export. Report which checks you actually performed. Keep manual playback pending when only stills or automated decoding were checked.

Use fictional or explicitly redistributable fixtures. Never commit private recordings, account details, credentials, generated renders or `node_modules`. Preserve original source files and use fresh output folders for revisions.

A useful bug report includes the command, versions from `npm run doctor`, expected behavior, actual error and a minimal nonprivate reproduction. Remove personal paths and account information from logs before posting them.

For maintainer GitHub implementation work, use GitHub's native stacked pull requests and verify actual stack membership. Each layer must work with its prerequisites and pass the relevant checks. If native stacks are unavailable, report the limitation rather than substituting ordinary chained PRs.
