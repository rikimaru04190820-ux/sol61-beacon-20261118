# Method and evidence limits

The sole runtime data source is the competition's frozen DefiLlama snapshot. Input dates and null fields are preserved. No live price, token-launch flag, distribution schedule, circulating supply, protocol revenue, reward rules, fee quote or eligibility data is invented.

Reference value = TVL × median peer market-cap/TVL × growth factor × tracking factor. Peer ratios are bounded to 0.02–20 before aggregation. The category requires at least three other peers; otherwise the global token-recorded sample is used. Growth factor = 1 + 0.35 × clamp(change_7d / 100, -0.5, 0.5). Tracking factor = 0.85 + 0.30 × min(days_tracked / 730, 1). Tracking days begin at the dataset listing date, not the protocol's launch. Missing growth or listing date uses a neutral factor of 1 and is visibly flagged. Values are rounded to whole dollars and sorted by value, with slug as a deterministic tie-break.

The 25th and 75th peer-ratio percentiles form a sensitivity range. It is neither a confidence interval nor an estimate of token allocation or future token price. Positive observed market caps are identified separately from model estimates. Model factors and missing inputs are available in every detail view and in board.json.

The initial Research candidates filter includes the supplied watchlist plus unrecorded rows outside it after the kit's category, exchange-name, wrapped/staked-word and version-name exclusions. It cannot check parent relationships because the snapshot omits that field. This heuristic is not verification of token absence. All 758 rows remain accessible through All token records, including excluded market context. A future listing date is treated as unavailable rather than as zero days tracked.

Farm steps are paper-first, category-level research scenarios. They include protocol-specific names, documentation verification, simulated capital, time, fee categories, withdrawal conditions and a review cadence. Real contract addresses, incentives, fees and eligibility are not verified. The page contains no mechanism to execute any of these actions.

Primary background sources consulted during development:

- https://docs.llama.fi/analysts/data-definitions — TVL changes can reflect asset-price changes, not only deposits or withdrawals.
- https://aave.com/docs/aave-v3/concepts/liquidity-pool — supply, reserve liquidity and collateral mechanics; these do not establish another lending protocol's terms.
- https://www.aave.com/help/supplying/withdraw-tokens — withdrawal and outstanding-debt constraints.
- https://blog.uniswap.org/how-liquidity-provision-in-defi-works — liquidity provision, fee variability and impermanent-loss tradeoffs; these are not verified rules of another exchange.

These sources inform the research questions, not a claim that every protocol implements Aave or Uniswap. The dashboard makes no network request, and its HTML attributes and imports contain no external URL.
