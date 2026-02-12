# Country Data Sources

ข้อมูลในแอพนี้มาจาก **official government sources** และ **verified data providers** ล่าสุดถึง **February 2026**

## ✅ Verified Data (16 Countries)

### 🇦🇺 Australia
- **Visa Fees**: Home Affairs (Jan 2026)
- **Salaries**: PayScale AU, SEEK (Feb 2026)
- **Cost of Living**: Numbeo (Feb 2026)
- **Notes**: Skills Independent 189 visa ข้อมูลอัปเดตหลังจาก Perplexity fact-check

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
- Updated visa costs: 189 visa $4,765/$7,150/$8,545 (Jan 2026)
- Exchange rate: 22.10 THB/AUD (Feb 2026 average)
- Salaries, living costs, tax calculations

---

## 🔍 Data Quality Checks

### ✅ Perplexity Fact-Check (Feb 12, 2026)
All data verified against official sources:
1. ✅ AU visa costs corrected (189: $4,765/$7,150/$8,545)
2. ✅ Exchange rate updated (22.10 THB/AUD)
3. ✅ Thai insurance updated (฿2,500/month)
4. ✅ Food costs adjusted (+$100/level)
5. ✅ Transport costs verified ($850 car)
6. ✅ Software salary confirmed ($75K entry)

### 📊 Coverage
- **Complete data**: 16 countries (AU, CA, UK, NZ, DE, SG, SE, UAE, NO, NL, IE, US, PT, KR, CH, JP)
- **Missing**: None for popular migration destinations

---

## 🔄 Update Schedule
- **Visa fees**: Check quarterly (Immigration websites)
- **Salaries**: Update semi-annually (PayScale, Glassdoor)
- **Cost of living**: Update monthly (Numbeo auto-updates)
- **Last full review**: February 12, 2026

---

## 📚 Additional Sources
- **OECD Better Life Index 2025**: Quality of life comparisons
- **Global Peace Index 2025**: Safety rankings
- **Numbeo Cost of Living**: Real-time crowd-sourced data
- **PayScale / Glassdoor**: Verified salary data from employees

---

## ⚠️ Disclaimer
Visa fees and immigration policies change frequently. Always verify current information on official government websites before making decisions:
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
