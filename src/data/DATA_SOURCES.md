# 📊 Data Sources & Audit Trail

> **Last Verified:** March 2026
> **Maintained by:** Manual verification against official sources
> **Review cycle:** Every SkillSelect invitation round (typically every 3-6 months)

---

## 1. SkillSelect Invitation Points (minPoints189 / minPoints491)

**Source:** Department of Home Affairs — SkillSelect Invitation Rounds
- **Current round URL:** https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds
- **Previous rounds:** https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/previous-rounds
- **Dashboard:** https://api.dynamic.reports.employment.gov.au/anonap/extensions/hSKLS02_SkillSelect_EOI_Data/hSKLS02_SkillSelect_EOI_Data.html

### Latest Round: 13 November 2025
- 189 invited: 10,000 EOIs
- 491 Family Sponsored: 300 EOIs

### How to read the data:
- `minPoints189`: Minimum score invited for Subclass 189 in the latest round
- `minPoints491`: Minimum score invited for Subclass 491 (Family Sponsored)
- `null` = "N/A*" = No EOIs available or didn't meet parameters (NOT the same as "didn't get invited")
- ICT occupations (Software Engineer, Developer Programmer, etc.) were **NOT listed** in the Nov 2025 round — likely hit occupation ceiling. Telecom Eng. (263311) in same ANZSCO family listed at 90 → used as reference point.

### ICT Occupations — Special Note:
Most ICT occupations (261xxx, 262xxx, 263xxx ANZSCO codes) were **not individually listed** in the Nov 2025 SkillSelect round. This typically means:
1. The occupation ceiling was already reached, OR
2. No EOIs with sufficient points were available

**Reference point:** Telecommunications Engineer (263311) and Multimedia Specialist (261211) — both in the ICT ANZSCO family — **were** listed in the Nov 2025 round at **90 points (189)**. Since Software Engineer (261313), Developer Programmer (261312), and similar ICT roles are typically more competitive than Telecom, the minimum for ICT is estimated at **90+ points** for 189 invitation.

This estimate is also consistent with migration agent community data (Iscah, OzLinks, migration forums).

---

## 2. Salary Data (p10 / median / p90)

**Primary Source:** PayScale Australia (https://www.payscale.com/research/AU/)
- Format: 10th percentile / Median / 90th percentile
- Updated: Jan-Feb 2026
- Sample sizes noted per occupation

**Secondary Sources (cross-checked):**
- SEEK Salary Insights: https://www.seek.com.au/career-advice/role/
- Indeed Salaries: https://au.indeed.com/career/salaries
- ABS Average Weekly Earnings: https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions

### Verified occupations (PayScale, Jan-Feb 2026):
| Occupation | p10 | Median | p90 | Sample Size | Source |
|---|---|---|---|---|---|
| Software Engineer | $65k | $90k | $127k | 1,262 profiles | PayScale Feb 2026 |
| Data Engineer | $71k | $104k | $146k | 244 profiles | PayScale Feb 2026 |
| Civil Engineer | $63k | $85k | $122k | 880 profiles | PayScale Jan 2026 |
| Mechanical Engineer | $63k | $83k | $125k | 1,074 profiles | PayScale Jan 2026 |
| Electrical Engineer | $64k | $87k | $130k | 703 profiles | PayScale Jan 2026 |
| Accountant | $52k | $68k | $90k | 1,830 profiles | PayScale Jan 2026 |
| Registered Nurse | $61k | $76k | $95k | 1,825 profiles | PayScale Jan 2026 (hourly×1,976) |
| Electrician | $49k | $73k | $99k | 845 profiles | PayScale Jan 2026 (hourly×1,976) |
| Plumber | $36k | $64k | $97k | 435 profiles | PayScale Jan 2026 (hourly×1,976) |
| Carpenter | $43k | $67k | $100k | 1,454 profiles | PayScale Jan 2026 (hourly×1,976) |
| Welder | $45k | $59k | $76k | 252 profiles | PayScale Dec 2025 (hourly×1,976) |
| Network Engineer | $61k | $88k | $127k | 187 profiles | PayScale Jan 2026 |

### Hourly → Annual conversion:
For trades and nursing occupations, PayScale reports hourly rates. Annual salary is calculated as:
`hourly rate × 38 hrs/week × 52 weeks = hourly × 1,976`
(38 hours = Australian standard full-time work week per Fair Work Act)

### Other occupations:
Salary data for occupations without direct PayScale verification uses:
- SEEK average salary ranges (noted as "SEEK estimate" in source)
- ABS industry averages
- Professional association data (Engineers Australia, ACS, AHPRA, etc.)

---

## 3. Occupation Lists (shortageList)

**Source:** Department of Home Affairs — Skilled Occupation Lists
- MLTSSL: https://www.legislation.gov.au/Series/F2014L00771
- CSOL: https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list
- ANZSCO: https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations

### List hierarchy:
- `MLTSSL;CSOL` = eligible for ALL skilled visas (189/190/482/186/485/489/491/494)
- `MLTSSL` = eligible for 189/190/485/489/491 (no 482/186)
- `STSOL` = eligible for 190/407/489/491/494 (no 189)
- `CSOL` = eligible for 482/186 only

---

## 4. Demand Level (demand)

**Methodology:** Combined signal from:
1. **Job posting volume** on SEEK (number of listings in last 90 days)
2. **SkillSelect invitation pattern** (low cut-off = high demand)
3. **Skills Priority List** (jobs.gov.au National Skills Commission)
4. **Professional association reports** (ACS for ICT, Engineers Australia, AHPRA)

| Level | Criteria |
|---|---|
| สูงมาก | High SEEK volume + low cut-off (65-75) + on priority list |
| สูง | Good SEEK volume + moderate cut-off (75-85) |
| ปานกลาง | Average SEEK volume + high cut-off (85+) |
| ต่ำ | Low SEEK volume + very high cut-off (90+) or niche role |

---

## 5. Cost of Living Data

**Source:** Numbeo (https://www.numbeo.com/cost-of-living/)
- Verified: Feb-Mar 2026
- Data is crowdsourced with contributor counts noted per city

### Australian cities (Numbeo Feb-Mar 2026):
| City | 1BR Rent (City) | Utilities (85m²) | Contributors | Last Update |
|---|---|---|---|---|
| Sydney | A$3,695 | A$294 | 1,520 entries | Mar 2026 |
| Melbourne | A$2,459 | A$309 | 1,711 entries | Feb 2026 |
| Brisbane | A$2,584 | A$281 | 1,431 entries | Feb 2026 |

### Transport notes:
- Sydney: Opal card, no monthly pass — weekly cap system ~A$50/week
- Melbourne: Myki monthly pass A$199
- Brisbane: 50¢ flat fare since Aug 2024 — monthly cap ~A$30

---

## 6. ANZSCO Codes

Each occupation includes the official ANZSCO code for unambiguous identification.
Look up any code at: https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations

---

## 7. How to Verify / Update

1. **Cut-off points**: Check latest SkillSelect round at the URL above
2. **Salary**: Search PayScale AU for the occupation title, note p10/median/p90
3. **Occupation list**: Check the legislation links above for current list membership
4. **Demand**: Check SEEK job count + Skills Priority List at jobs.gov.au

---

## 8. Country Score Reference Data (criteria scores 1–10)

> **Purpose**: Every country score in `country-data.ts` must trace back to a published index value.
> Each country has a `// REF:` comment showing `sourceValue→score` per criteria.

### 8.1 Source URLs

| Criteria | Index | URL | Data Year |
|---|---|---|---|
| costOfLiving | Numbeo Cost of Living Index (TH=100) | https://www.numbeo.com/cost-of-living/rankings_by_country.jsp | 2026 |
| safety | Global Peace Index (IEP) | https://www.visionofhumanity.org/maps/ | 2025 |
| healthcare | WHO Healthcare Access & Quality Index | Lancet 2018; DOI: 10.1016/S0140-6736(18)30994-2 | 2019 |
| education | OECD PISA 2022 + QS/THE uni rankings | https://www.oecd.org/pisa/ | 2022 |
| workLifeBalance | OECD Better Life Index (hours + leave) | https://www.oecdbetterlifeindex.org/ | 2024 |
| taxFriendliness | PwC Tax Summaries / KPMG | https://taxsummaries.pwc.com/ | 2025 |
| immigrationEase | Qualitative (multiple sources) | Various immigration agency sites | 2025 |
| jobMarket | OECD Unemployment Rate | https://data.oecd.org/unemp/unemployment-rate.htm | 2024 |
| climate | Subjective (Thai comfort) | Climate-Data.org | - |
| politicalStability | World Bank WGI | https://info.worldbank.org/governance/wgi/ | 2023 |

### 8.2 Scoring Formulas

**costOfLiving** (from costIndex, TH=100):
| costIndex Range | Score |
|---|---|
| < 110 | 9 |
| 110–130 | 8 |
| 131–150 | 7 |
| 151–170 | 6 |
| 171–195 | 5 |
| 196–215 | 4 |
| 216–250 | 3 |
| 251–290 | 2 |
| 291+ | 1 |

**safety** (GPI 2025 rank):
| GPI Rank | Score |
|---|---|
| #1–5 | 10 |
| #6–15 | 9 |
| #16–25 | 8 |
| #26–40 | 7 |
| #41–60 | 6 |
| #61–80 | 5 |
| #81–110 | 4 |
| #111+ | 3 |

**healthcare** (WHO HAQ score):
| HAQ Score | Score |
|---|---|
| 90+ | 10 |
| 87–89 | 9 |
| 84–86 | 8 |
| 80–83 | 7 |
| 75–79 | 6 |
| 70–74 | 5 |
| < 70 | 4 |

**politicalStability** (WGI percentile):
| WGI %ile | Score |
|---|---|
| 90+ | 10 |
| 80–90 | 9 |
| 70–80 | 8 |
| 60–70 | 7 |
| 50–60 | 6 |
| < 50 | 5 |

### 8.3 Safety — GPI 2025 Raw Data (verified Mar 2026)

Source: https://www.visionofhumanity.org/maps/ (Global Peace Index 2025)

| Country | GPI Rank | GPI Score | → Our Score |
|---|---|---|---|
| Ireland 🇮🇪 | #2 | 1.260 | 10 |
| New Zealand 🇳🇿 | #3 | 1.282 | 10 |
| Switzerland 🇨🇭 | #4 | 1.294 | 10 |
| Singapore 🇸🇬 | #6 | 1.357 | 9 |
| Portugal 🇵🇹 | #7 | 1.371 | 9 |
| Japan 🇯🇵 | #12 | 1.440 | 9 |
| Canada 🇨🇦 | #14 | 1.491 | 9 |
| Netherlands 🇳🇱 | #14 | 1.491 | 9 |
| Australia 🇦🇺 | #18 | 1.505 | 8 |
| Germany 🇩🇪 | #20 | 1.533 | 8 |
| United Kingdom 🇬🇧 | #30 | 1.634 | 7 |
| Norway 🇳🇴 | #32 | 1.644 | 7 |
| Sweden 🇸🇪 | #35 | 1.709 | 7 |
| South Korea 🇰🇷 | #41 | 1.736 | 6 |
| UAE 🇦🇪 | #52 | 1.812 | 6 |
| USA 🇺🇸 | #128 | 2.443 | 3 |

> **Note**: GPI measures "peacefulness" including militarisation and conflict involvement, not just crime safety.
> UAE (#52) has near-zero crime but low GPI due to military spending/regional involvement.
> Japan (#12) has near-zero violent crime (Numbeo Crime Index 22.8).
> USA (#128) is penalised by military spending, gun violence, and incarceration rate.

### 8.4 Healthcare — WHO HAQ Raw Data

Source: GBD 2016 Healthcare Access and Quality Index (Lancet, 2018)

| Country | HAQ Score | → Our Score |
|---|---|---|
| Switzerland 🇨🇭 | 92 | 10 |
| Norway 🇳🇴 | 90 | 10 |
| Netherlands 🇳🇱 | 90 | 10 |
| Australia 🇦🇺 | 89 | 9 |
| Japan 🇯🇵 | 89 | 9 |
| Sweden 🇸🇪 | 88 | 9 |
| Germany 🇩🇪 | 88 | 9 |
| Canada 🇨🇦 | 88 | 9 |
| South Korea 🇰🇷 | 87 | 9 |
| New Zealand 🇳🇿 | 87 | 9 |
| Singapore 🇸🇬 | 86 | 8 |
| Ireland 🇮🇪 | 85.5 | 8 |
| United Kingdom 🇬🇧 | 85 | 8 |
| Portugal 🇵🇹 | 82 | 7 |
| USA 🇺🇸 | 81 | 7 |
| UAE 🇦🇪 | 72 | 5 |

> **Note**: WHO HAQ measures health outcomes (amenable mortality), not user experience.
> UAE (72) has improved significantly since 2016 (Cleveland Clinic Abu Dhabi etc.) — HAQ data may understate current quality.
> USA (81) has high quality IF insured, but no universal coverage reduces overall outcomes.
> Numbeo Healthcare Index 2026 differs: S.Korea #2 (82.9), Japan #4 (80.1), UK #20 (72.7), USA (67.0), Canada (68.6).

### 8.5 Cost of Living — costIndex Verification

costIndex formula: `(Numbeo Country CLI / Bangkok CLI) × 100` where Bangkok CLI ≈ 41.4 on NYC=100 scale.

| Country | costIndex | Band | → Our Score |
|---|---|---|---|
| Portugal 🇵🇹 | 131 | 131–150 | 7 |
| Japan 🇯🇵 | 131 | 131–150 | 7 |
| UAE 🇦🇪 | 149 | 131–150 | 7 |
| New Zealand 🇳🇿 | 152 | 151–170 | 6 |
| Canada 🇨🇦 | 163 | 151–170 | 6 |
| South Korea 🇰🇷 | 165 | 151–170 | 6 |
| Germany 🇩🇪 | 169 | 151–170 | 6 |
| Australia 🇦🇺 | 181 | 171–195 | 5 |
| Ireland 🇮🇪 | 185 | 171–195 | 5 |
| Sweden 🇸🇪 | 190 | 171–195 | 5 |
| Netherlands 🇳🇱 | 200 | 196–215 | 4 |
| United Kingdom 🇬🇧 | 211 | 196–215 | 4 |
| Singapore 🇸🇬 | 212 | 196–215 | 4 |
| Norway 🇳🇴 | 218 | 216–250 | 3 |
| USA 🇺🇸 | 242 | 216–250 | 3 |
| Switzerland 🇨🇭 | 286 | 251–290 | 2 |

### 8.6 How to Verify Scores

1. **safety**: Open https://www.visionofhumanity.org/maps/ → find country rank → apply formula
2. **healthcare**: Search "GBD healthcare access quality index [country]" or check Lancet paper
3. **costOfLiving**: Check `costIndex` in code → apply band formula above
4. **politicalStability**: Open https://info.worldbank.org/governance/wgi/ → select country → Political Stability percentile → apply formula
5. **Other criteria**: See `// REF:` comment above each country in `country-data.ts`

---

## 9. Known Limitations

- SkillSelect doesn't always publish per-occupation data for ALL occupations in each round
- ICT occupations frequently hit ceiling early in the program year
- Salary data varies significantly by city (Sydney/Melbourne +10-20% vs regional)
- PayScale sample sizes vary; smaller samples = less reliable
- Cut-off points change each round — treat as "latest known" not "guaranteed"
- Trades p10 values from PayScale include apprentice/trainee rates (may be below minimum wage)
- Cost of living data is crowdsourced (Numbeo) — sample sizes vary by city
- Brisbane transport costs dramatically reduced by 50¢ flat fare policy (Aug 2024) — may change
- WHO HAQ data is from 2016/2018 — some countries (UAE, Singapore) may have improved significantly
- GPI measures "peacefulness" not "personal safety" — includes military/conflict factors
- workLifeBalance, education, immigrationEase, climate are qualitative composites (not single-index derived)
