# FridayList — Black Friday 2026 Deal Finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/rosyidaibnu-ai/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/rosyidaibnu-ai/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

FridayList is a Black Friday 2026 deal finder: 36 real deals from Amazon, Best Buy, Walmart, Target and Home Depot, each with its product, store, store link, sale price, usual price, discount, check time and source — plus an honest verdict on whether it is really a deal (new low, strong deal, or routine sale). Search and filters by category, store and discount all work, and every deal opens its own detail page.

All 36 prices were read on 27 November 2026, 06:30 UTC, at the store or in a deals source that names the store. Nothing is fetched from the network at run time: the site is static files under `app/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

## Hand in

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=5t2hrdpp&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
