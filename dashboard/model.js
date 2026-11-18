export const MODEL={name:'Peer reference · v1',peerFloor:.02,peerCeiling:20,minCategoryPeers:3,growthWeight:.35,ageDays:730,ageFloor:.85,ageSpan:.30};
export const hasToken=p=>Boolean(p.gecko_id||p.symbol);
const EXCLUDED_CATEGORIES=new Set(['Bridge','Canonical Bridge','Liquid Staking','Liquid Restaking','Restaked BTC','CEX']);
export function candidateClass(p,watchlist){
 if(hasToken(p))return {candidate:false,reason:'Token recorded'};
 if(watchlist.has(p.slug))return {candidate:true,reason:'Supplied watchlist; token status still needs verification'};
 if(EXCLUDED_CATEGORIES.has(p.category)||/\b(?:wrapped|staked|staking)\b/i.test(p.name)||/^(?:Binance|Coinbase|Bybit|Kraken|Bitget|OKX|Bitfinex|Gemini)\b/i.test(p.name)||/\s[vV]?\d+(?:\.\d+)?$/.test(p.name))return {candidate:false,reason:'Wrapped, exchange, category or version exclusion heuristic'};
 return {candidate:true,reason:'Unrecorded outside watchlist; verify parent protocol and identity'};
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function quantile(values,q){const s=[...values].sort((a,b)=>a-b);if(!s.length)return 1;const i=(s.length-1)*q,l=Math.floor(i);return s[l]+(s[Math.ceil(i)]-s[l])*(i-l);}
export function trackedDays(p,asOf){if(!p.listed_at)return null;const days=(Date.parse(asOf+'T00:00:00Z')-Date.parse(p.listed_at+'T00:00:00Z'))/86400000;return Number.isFinite(days)&&days>=0?Math.floor(days):null;}
export function peerEvidence(selected,median){
 const observations=selected.map(p=>{
  const raw=p.mcap_usd/p.tvl_usd;
  const bounded=clamp(raw,MODEL.peerFloor,MODEL.peerCeiling);
  return {
   slug:p.slug,
   name:p.name,
   category:p.category||'Unclassified',
   observed_ratio:raw,
   bounded_ratio:bounded,
   clipped:bounded!==raw
  };
 });
 const examples=[...observations].sort((a,b)=>{
  const distance=Math.abs(a.bounded_ratio-median)-Math.abs(b.bounded_ratio-median);
  return distance||(a.slug<b.slug?-1:a.slug>b.slug?1:0);
 }).slice(0,5);
 return {
  sample:examples,
  clipped_count:observations.filter(p=>p.clipped).length,
  note:'Examples nearest the median, not the entire peer universe. Protocol records can have overlapping exposures; these are not independent observations.'
 };
}
export function participationPlan(p,classification){
 const category=(p.category||'').toLowerCase(),name=p.name;
 const steps=[`Verify ${name}'s identity, official contracts, current eligibility and any points terms from primary documentation. Allow 20–30 minutes and $0 for research; no launch or reward is inferred from the snapshot.${classification&&!classification.candidate?' This row is market context, not a launch candidate under the filter.':''}`];
 let pilot;
 if(category.includes('lend')||category==='cdp')pilot='Model a $100 unlevered supply position for 14 days, including reserve liquidity, withdrawal limits and interest. Do not include borrowing or liquidation-sensitive loops in this pilot.';
 else if(category.includes('dex')||category.includes('liquidity'))pilot='Model a $100 two-asset liquidity position for 14 days. Compare fees with a 20% relative-price move, range exits, slippage and impermanent loss before considering participation.';
 else if(category.includes('staking')||category.includes('restaking'))pilot='Model a $100 position for 30 days, including lock-up, unbonding, withdrawal queues and slashing scenarios. Do not assume a liquid exit or stack additional leverage.';
 else if(category.includes('bridge'))pilot='Map the official source and destination chains, supported assets and finality. Simulate one $25 round trip and account for both chain fees and a delayed return; do not transfer funds from this dashboard.';
 else if(category.includes('derivative')||category.includes('basis'))pilot='Paper-track a $100 notional, unlevered scenario for 14 days. Record funding, basis, fees and a 20% adverse move; avoid a live leveraged position merely to seek points.';
 else if(category.includes('cex')||category.includes('rwa')||category.includes('cedefi'))pilot='Review access restrictions, custody, redemption terms and any identity requirements before modelling a $100 position for 30 days. Stop if the official product is unavailable in the reader’s jurisdiction.';
 else if(category.includes('curator')||category.includes('allocator')||category.includes('yield')||category.includes('vault'))pilot='Model a $100 vault position for 14 days, tracing underlying exposures, curator permissions, performance fees, queues and withdrawal conditions. Compare at least two allocation scenarios.';
 else pilot='Map the protocol’s documented participation path and available test environment. Spend 30 minutes on a zero-capital simulation, recording eligibility, permissions, exit conditions and any recurring activity required.';
 steps.push(`${name}: ${pilot} This is a paper-first plan; simulation capital and execution cost are $0.`);
 steps.push(`Build a cost sheet before any optional real participation: capital at risk, entry and exit gas, protocol fees, bridge fees and weekly time. The snapshot supplies none of these quotes. Research budget: 15 minutes; live costs remain unverified.`);
 steps.push(`For ${name}, review the simulated position weekly for four weeks (10 minutes per week, $0). Record activity and withdrawal feasibility. Recheck official terms; discontinue the thesis if eligibility is absent, costs exceed the reader’s own limit, or risks change.`);
 return steps;
}
export function buildBoard(snapshot){
 const peers=snapshot.protocols.filter(p=>hasToken(p)&&p.mcap_usd>0&&p.tvl_usd>0);
 const ratio=p=>clamp(p.mcap_usd/p.tvl_usd,MODEL.peerFloor,MODEL.peerCeiling);
 const globalRatios=peers.map(ratio),watch=new Set(snapshot.watchlist);
 const rows=snapshot.protocols.map(p=>{
  const category=p.category||'Unclassified';
  const classification=candidateClass(p,watch);
  const categoryPeers=peers.filter(q=>(q.category||'Unclassified')===category&&q.slug!==p.slug);
  const local=categoryPeers.length>=MODEL.minCategoryPeers,selected=local?categoryPeers:peers.filter(q=>q.slug!==p.slug),ratios=selected.map(ratio);
  const median=quantile(ratios.length?ratios:globalRatios,.5),low=quantile(ratios.length?ratios:globalRatios,.25),high=quantile(ratios.length?ratios:globalRatios,.75);
  const age=trackedDays(p,snapshot.as_of),growth=p.change_7d==null?null:Number(p.change_7d);
  const growthFactor=1+clamp((growth??0)/100,-.5,.5)*MODEL.growthWeight;
  const ageFactor=age==null?1:MODEL.ageFloor+MODEL.ageSpan*clamp(age/MODEL.ageDays,0,1);
  const modelValue=p.tvl_usd*median*growthFactor*ageFactor;
  const observed=hasToken(p)&&p.mcap_usd>0;
  const value=Math.round(clamp(observed?p.mcap_usd:modelValue,1,1e14));
  const lower=Math.round(clamp(p.tvl_usd*low*growthFactor*ageFactor,1,1e14)),upper=Math.round(clamp(p.tvl_usd*high*growthFactor*ageFactor,1,1e14));
  return {...p,category,implied_value_usd:value,model_value_usd:Math.round(clamp(modelValue,1,1e14)),value_basis:observed?'Observed market cap':'Peer reference estimate',token_recorded:hasToken(p),research_candidate:classification.candidate,candidate_reason:classification.reason,watchlist:watch.has(p.slug),tracking_days:age,peer_count:selected.length,peer_scope:local?'Category':'Global fallback',peer_multiple:median,peer_evidence:peerEvidence(selected,median),growth_factor:growthFactor,tracking_factor:ageFactor,range_low_usd:Math.min(lower,upper),range_high_usd:Math.max(lower,upper),missing_inputs:[...(age==null?['Tracking date']:[]),...(growth==null?['7-day TVL change']:[])],farm_steps:participationPlan(p,classification)};
 });
 rows.sort((a,b)=>b.implied_value_usd-a.implied_value_usd||(a.slug<b.slug?-1:a.slug>b.slug?1:0));
 rows.forEach((p,i)=>p.rank=i+1);
 return {as_of:snapshot.as_of,source:snapshot.source,floor_usd:snapshot.floor_usd,watchlist:snapshot.watchlist,methodology:MODEL,rows};
}
