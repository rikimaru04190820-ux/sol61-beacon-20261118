# Beacon — Protocol Research Radar

A read-only, offline research dashboard for token-radar-01. It ranks all protocols in the supplied snapshot, covers its watchlist, separates token-recorded and unrecorded entries, exposes every valuation factor and offers category-specific paper-first participation plans with explicit time and cost assumptions.

It does not connect wallets, buy tokens, transfer funds, sign, farm or call a model. Protocol identity, current eligibility and execution fees are not supplied by the snapshot and are explicitly unverified. A missing token record does not prove absence or future issuance.

Run main.ts with Node 22.18+. By default it reads /input/snapshot.json and writes /output; development overrides are MAKEFUN_SNAPSHOT_FILE and MAKEFUN_OUTPUT_DIR. The output includes board.json, data.js, dashboard/, screenshots/ and the official dossier. Open dashboard/index.html from the generated output; all data and assets are local.

The peer-reference model is implemented in dashboard/model.js and included in the dossier source. Existing tokens use the recorded market cap when available; unrecorded entries use a clipped median market-cap/TVL peer multiple with bounded TVL-change and tracking-duration adjustments. The range is peer dispersion, not a confidence interval or price forecast.

vendor/makefun-board.ts is copied unchanged from the official kit. MIT license. Original interface and model authored in a native gpt-6.1-sol Codex session.
