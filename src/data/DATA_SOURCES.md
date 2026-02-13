# 📊 Occupation Data Sources & Audit Trail

> **Last Updated:** Feb 2026
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
- ICT occupations (Software Engineer, Developer Programmer, etc.) were **NOT listed** in the Nov 2025 round — likely hit occupation ceiling. Historical data suggests 85-95+ required.

### ICT Occupations — Special Note:
Most ICT occupations (261xxx, 262xxx, 263xxx ANZSCO codes) were **not individually listed** in the Nov 2025 SkillSelect round. This typically means:
1. The occupation ceiling was already reached, OR
2. No EOIs with sufficient points were available

Based on Aug 2025 round + migration agent community data, ICT generally requires **90-95+ points** for 189 invitation. The `minPoints189` values for ICT in our data use community consensus (Iscah, OzLinks, migration forums) since official per-occupation data isn't published for these roles.

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
| Software Engineer | $65k | $90k | $127k | 1,262 profiles | PayScale Jan 2026 |
| Network Engineer | $61k | $88k | $127k | 187 profiles | PayScale Jan 2026 |
| Data Engineer | $71k | $104k | $146k | ~244 profiles | PayScale Feb 2026 |

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

## 5. ANZSCO Codes

Each occupation includes the official ANZSCO code for unambiguous identification.
Look up any code at: https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations

---

## 6. How to Verify / Update

1. **Cut-off points**: Check latest SkillSelect round at the URL above
2. **Salary**: Search PayScale AU for the occupation title, note p10/median/p90
3. **Occupation list**: Check the legislation links above for current list membership
4. **Demand**: Check SEEK job count + Skills Priority List at jobs.gov.au

---

## 7. Known Limitations

- SkillSelect doesn't always publish per-occupation data for ALL occupations in each round
- ICT occupations frequently hit ceiling early in the program year
- Salary data varies significantly by city (Sydney/Melbourne +10-20% vs regional)
- PayScale sample sizes vary; smaller samples = less reliable
- Cut-off points change each round — treat as "latest known" not "guaranteed"
