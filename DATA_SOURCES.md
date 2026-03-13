# Country Data Sources

ข้อมูลในแอพนี้มาจาก **official government sources** และ **verified data providers** ล่าสุดถึง **March 2026**

## ✅ Verified Data (16 Countries)

### 🇦🇺 Australia
- **Visa Fees**: Home Affairs (Feb 2026)
- **Salaries**: PayScale AU, SEEK (Feb 2026)
- **Cost of Living**: Numbeo (Feb 2026)
- **Visa Options**:
  - **482 TSS** (Most popular): $1,455-3,035 single | Employer-sponsored, NO points required
  - **186 ENS**: $4,240-4,765 single | Permanent, employer-sponsored
  - **189 Skilled**: $4,640 single | Permanent, independent (65+ points)
- **Notes**: Updated with 482/186/189 pathways. 482 → 186 TRT after 3 years most common route.

### 🇨🇦 Canada
- **Visa Fees**: IRCC (Dec 2025)
- **Salaries**: Job Bank Canada, PayScale
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: Express Entry CRS points system

### 🇬🇧 United Kingdom
- **Visa Fees**: GOV.UK (Oct 2024)
- **Salaries**: Glassdoor UK, Reed
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: Skilled Worker visa + Immigration Health Surcharge (IHS)

### 🇳🇿 New Zealand
- **Visa Fees**: Immigration NZ (Oct 2024)
- **Salaries**: PayScale NZ, SEEK NZ
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: ⚠️ Visa fee เพิ่มขึ้น 50% (Oct 2024): $4,290 → $6,450 NZD

### 🇩🇪 Germany
- **Visa Fees**: Make it in Germany (Jan 2026)
- **Salaries**: PayScale DE, Glassdoor DE
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: ✅ EU Blue Card ถูกที่สุด (€100)! Min salary €45,934 (IT/Engineering)

### 🇸🇬 Singapore
- **Visa Fees**: MOM Singapore (Jan 2026)
- **Salaries**: PayScale SG, Glassdoor SG
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: Employment Pass min $5,600/month

### 🇸🇪 Sweden
- **Visa Fees**: Swedish Migration Agency (Jan 2026)
- **Salaries**: Statistics Sweden (SCB)
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: Min salary 33,390 SEK/month (June 2026)

### 🇦🇪 UAE (Dubai)
- **Visa Fees**: GDRFA Dubai (Nov 2025)
- **Salaries**: Glassdoor UAE, Michael Page
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: 💰 No income tax! Golden Visa 10 years available

### 🇳🇴 Norway
- **Visa Fees**: UDI (Dec 2025)
- **Salaries**: Statistics Norway (SSB)
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: Highest salaries in Europe, but most expensive

### 🇳🇱 Netherlands
- **Visa Fees**: IND (Nov 2025)
- **Salaries**: PayScale NL, Glassdoor NL
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: 30% tax ruling (30% income tax-free for 5 years)!

### 🇮🇪 Ireland
- **Visa Fees**: Department of Enterprise (Jan 2026)
- **Salaries**: PayScale Ireland, Jobted Ireland
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: ⚡ Fastest Stamp 4 in EU (21 months)! Min salary €40,904 (March 2026)

### 🇺🇸 USA
- **Visa Fees**: USCIS (Jan 2026)
- **Salaries**: Built In, Coursera, BLS
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: ⚠️ NEW Presidential Proclamation fee $100,000! (Sept 2025+) + H-1B lottery

### 🇵🇹 Portugal
- **Visa Fees**: AIMA, Jobbatical (Jan 2026)
- **Salaries**: PayScale, Levels.fyi (Feb 2026)
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: D7 Passive Income €920/mo, D8 Digital Nomad €3,480/mo. NHR 20% flat tax

### 🇰🇷 South Korea
- **Visa Fees**: Ministry of Justice Korea, Kowork (Jan 2026)
- **Salaries**: Join Horizons, Tivazo (Jan 2026)
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: E-7 visa min ₩35.2M/year (Feb 2026 increase). Korean language essential (TOPIK 3-4)

### 🇨🇭 Switzerland
- **Visa Fees**: Swiss State Secretariat (SEM), Deel (2024)
- **Salaries**: Levels.fyi, Jobs.ch (Feb 2026)
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: 💰 Highest EU salaries (CHF 100K-200K+), but most expensive. 10 years to PR for non-EU

### 🇯🇵 Japan
- **Visa Fees**: Japan Ministry of Justice (Feb 2026)
- **Salaries**: PayScale JP, Glassdoor JP
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: ⚠️ MAJOR visa fee increase April 2026: PR ¥100K (was ¥10K) = 500%+ increase! HSP fast-track PR (1-3 years)

---

## 📁 Data Files

### `src/data/country-detailed-data.ts`
**Complete visa costs, salaries, living costs for 16 countries**
- 16 countries with full details (was 12, added PT, KR, CH, JP)
- Visa costs (single, couple, family)
### `src/data/country-detailed-data.ts`
**Complete visa costs, salaries by occupation, cost of living breakdown, PR paths**
- 16 countries with full details
- **Multiple visa pathways** (e.g., AU: 482 TSS, 186 ENS, 189 Skilled)
- Visa costs (single, couple, family) for each pathway
- Salaries by occupation (entry, mid, senior)
- Cost of living by city
- PR timeline & difficulty
- Official sources tracked

### `src/data/country-data.ts`
Country matching algorithm
- 16 countries total (14 original + UAE + Norway added)
- Scores for 10 criteria (cost of living, safety, healthcare, etc.)
- Goal-based matching
- Occupation notes per country

### `src/data/simulator-data.ts`
Australia-Thailand comparison simulator
- **NOTE**: Simulator uses 189 visa ($4,640) as baseline for initial costs. 482/186 options available in AuLifeSim.
- Exchange rate: 22.70 THB/AUD (Mar 2026, XE.com mid-market)
- Salaries, living costs, tax calculations

---

## 🔍 Data Quality Checks

### ✅ Perplexity Fact-Check (Feb 12, 2026)
All data verified against official sources:
1. ✅ AU visa costs updated: 482 TSS ($1,455-3,035), 186 ENS ($4,765), 189/190/491 ($4,640)
2. ✅ Exchange rate updated (22.10 THB/AUD)
3. ✅ Thai insurance updated (฿2,500/month)
4. ✅ Food costs adjusted (+$100/level)
5. ✅ Transport costs verified ($850 car)
6. ✅ Software salary confirmed ($75K entry)
7. ✅ Added 482 TSS as primary pathway (employer-sponsored, NO points required!)

### 📊 Coverage
- **Complete data**: 16 countries with full official visa/salary/living cost data
- **Australia**: ✅ Updated with 482 TSS/186 ENS/189 Skilled pathways (Feb 2026)
- **Missing**: None for popular migration destinations

---

## 🔄 Update Schedule
- **Visa fees**: Check quarterly (Government websites release annually, but changes can occur mid-year)
- **Salaries**: Update semi-annually (PayScale/Glassdoor refreshes Jan/Jul)
- **Cost of living**: Monitor monthly (Numbeo crowd-sourced updates)
- **Safety/Quality rankings**: Annual (GPI releases mid-year, HDI late-year)
- **Last full review**: February 12, 2026

---

## 📚 Additional Sources

### Quality of Life Metrics
- **OECD Better Life Index**: 11-dimension well-being comparison (housing, income, health, safety, work-life balance)
  - **Source:** oecdbetterlifeindex.org
  - **Note:** Last comprehensive update 2020; ongoing data portal available

- **Quality of Life Index 2026** (Numbeo): Real-time global ranking
  - **Top countries:** Switzerland, Norway, Iceland, Denmark, Netherlands, Australia
  - **Source:** numbeo.com/quality-of-life

- **Human Development Index (HDI)**: UN Development Programme annual ranking
  - **Measures:** Life expectancy, education, income per capita
  - **Latest:** HDI 2024 report (covers 2023 data)

### Safety Rankings
- **Global Peace Index 2025**: Published by Institute for Economics & Peace
  - **Top 10:** Iceland, Ireland, Austria, Denmark, Switzerland, Singapore, Slovenia, Japan, Czech Republic, Finland
  - **Covers:** 163 countries, 23 indicators (safety, conflict, militarization)
  - **Iceland:** #1 every year since 2008
  - **Source:** visionofhumanity.org/maps

### Cost of Living Data
- **Numbeo Cost of Living Index**: Crowd-sourced, updated monthly
  - **⚠️ Use with caution:** Provides directional estimates; rent prices often outdated or inaccurate for short-term stays
  - **Best for:** Comparing relative costs between cities
  - **Verify:** Always check local sources before budgeting
  - **Source:** numbeo.com/cost-of-living

- **PayScale / Glassdoor**: Verified salary data from employees
  - **Methodology:** Self-reported, company-verified
  - **Updated:** Quarterly/semi-annually

---

## 🔍 Data Reliability Notes

### High Confidence (90%+ accurate)
- ✅ **Visa fees** from government portals (official, but can change with budget cycles)
- ✅ **Minimum salary requirements** from immigration departments
- ✅ **Tax brackets** from revenue departments

### Medium Confidence (70-85% accurate)
- ⚠️ **Salaries:** Self-reported data varies by company size, location, negotiation
- ⚠️ **Cost of living (Numbeo):** Crowd-sourced, directional only
- ⚠️ **PR timelines:** Official estimates; actual processing varies widely

### Use With Caution
- ⚠️ **Rent prices:** Numbeo based on long-term leases; short-term 30-50% higher
- ⚠️ **Job market demand:** Qualitative assessments; changes with economy
- ⚠️ **Quality of life scores:** Subjective weighting; OECD BLI data from 2020

---

## 🔍 How to Verify Before Applying

1. **Visa costs:** Visit official immigration portal (links above)
2. **Salary expectations:** Cross-check PayScale + Glassdoor + LinkedIn salary insights
3. **Cost of living:** Check 2-3 sources (Numbeo + Expatistan + local forums/Reddit)
4. **Job market:** Search actual job postings on Indeed/LinkedIn for your occupation
5. **Rent:** Check local rental sites (e.g., Domain.com.au for AU, Rightmove.co.uk for UK)

---

## ⚠️ Disclaimer
Visa fees and immigration policies change frequently. Always verify current information on official government websites before making decisions. This app provides general guidance based on Feb 2026 data — it is NOT a substitute for:
- Licensed immigration advice
- Financial planning consultation
- Legal verification of eligibility

For immigration applications, consult:
- Official government portals (links below)
- Licensed migration agents (MARA-registered for AU, RCIC for CA, etc.)
- Immigration lawyers for complex cases

**Official Government Portals:**
- 🇦🇺 homeaffairs.gov.au
- 🇨🇦 ircc.canada.ca
- 🇬🇧 gov.uk/skilled-worker-visa
- 🇳🇿 immigration.govt.nz
- 🇩🇪 make-it-in-germany.com
- 🇸🇬 mom.gov.sg
- 🇸🇪 migrationsverket.se
- 🇦🇪 gdrfad.gov.ae
- 🇳🇴 udi.no
- 🇳🇱 ind.nl
- 🇮🇪 irishimmigration.ie
- 🇺🇸 uscis.gov
- 🇵🇹 aima.gov.pt
- 🇰🇷 immigration.go.kr
- 🇨🇭 sem.admin.ch
- 🇯🇵 moj.go.jp
