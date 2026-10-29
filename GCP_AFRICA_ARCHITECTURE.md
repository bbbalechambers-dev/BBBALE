# Google Cloud Africa Regional Deployment & Geo-Restriction Architecture

## B. B. BALE & CO Chambers Management System

### 1. Executive Summary
This document outlines the architecture and deployment profile for restricting access to **B. B. BALE & CO Chambers Management System** exclusively to the **African continent** on **Google Cloud**.

- **Primary Cloud Region**: `africa-south1` (Johannesburg, South Africa)
- **Edge Points of Presence (PoPs)**: Lagos (Nigeria), Nairobi (Kenya), Johannesburg (South Africa)
- **Security Policy**: Google Cloud Armor Geo-Fencing (`chambers-africa-only-policy`)
- **Enforcement Layer**: Dual-layer (Google Cloud Armor at the Edge + Express Server Middleware & Client-Side Jurisdiction Shield)
- **Regulatory Framework**: Nigerian Data Protection Act (NDPA 2023), Nigerian Bar Association (NBA) Rules of Professional Conduct, and African Continental Free Trade Area (AfCFTA) Legal Services Protocol.

---

### 2. Multi-Layer Restriction Architecture

```
                    [ INCOMING INTERNET TRAFFIC ]
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │  LAYER 1: Google Cloud Armor Security Policy           │
      │  Evaluates: origin.region_code                         │
      │  - If in 54 African Sovereign ISO codes: ALLOW         │
      │  - If Extra-Continental IP (US, EU, ASIA): DENY (403)   │
      └───────────────────────────┬────────────────────────────┘
                                  │ (Allowed Traffic)
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │  LAYER 2: Google Cloud Load Balancer & Cloud Run       │
      │  Region: africa-south1 (Johannesburg Node)             │
      │  Transmits: x-client-geo-region, x-appengine-country   │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │  LAYER 3: Server-Side Geo-Fencing (server.ts)          │
      │  - Validates client IP & country ISO code              │
      │  - Emergency bypass for Authorized International       │
      │    Chambers Counsel (BBB-AFRICA-CHAMBERS-2026)         │
      │  - Blocks non-African API requests with 403 Forbidden  │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │  LAYER 4: Frontend African Jurisdiction Shield (React) │
      │  - Authoritative NBA / Chambers boundary screen        │
      │  - Real-time simulation and compliance audit console   │
      └────────────────────────────────────────────────────────┘
```

---

### 3. Allowed Jurisdictions (54 African Nations)

The system admits IP traffic originating exclusively from the 54 sovereign member states of the African Union:
- **West Africa**: Nigeria (`NG`), Ghana (`GH`), Senegal (`SN`), Côte d'Ivoire (`CI`), Benin (`BJ`), Togo (`TG`), Liberia (`LR`), Sierra Leone (`SL`), Guinea (`GN`), Guinea-Bissau (`GW`), Mali (`ML`), Burkina Faso (`BF`), Niger (`NE`), Cabo Verde (`CV`), The Gambia (`GM`), Mauritania (`MR`).
- **Southern Africa**: South Africa (`ZA`), Botswana (`BW`), Namibia (`NA`), Zimbabwe (`ZW`), Zambia (`ZM`), Mozambique (`MZ`), Angola (`AO`), Lesotho (`LS`), Eswatini (`SZ`), Malawi (`MW`).
- **East Africa**: Kenya (`KE`), Rwanda (`RW`), Uganda (`UG`), Tanzania (`TZ`), Ethiopia (`ET`), Mauritius (`MU`), Seychelles (`SC`), Madagascar (`MG`), Burundi (`BI`), Djibouti (`DJ`), Eritrea (`ER`), Somalia (`SO`), South Sudan (`SS`), Comoros (`KM`).
- **North Africa**: Egypt (`EG`), Morocco (`MA`), Algeria (`DZ`), Tunisia (`TN`), Libya (`LY`), Sudan (`SD`).
- **Central Africa**: Cameroon (`CM`), DR Congo (`CD`), Congo (`CG`), Gabon (`GA`), Equatorial Guinea (`GQ`), Chad (`TD`), Central African Republic (`CF`), São Tomé and Príncipe (`ST`).

---

### 4. Google Cloud Armor Policy Commands

To deploy or inspect the Cloud Armor policy in Google Cloud:

```bash
# Describe policy
gcloud compute security-policies describe chambers-africa-only-policy --project=smurfy-medley-4xtlg

# Deploy to Cloud Run in africa-south1
gcloud run deploy bb-bale-chambers \
  --source . \
  --region africa-south1 \
  --project smurfy-medley-4xtlg
```

---

### 5. Emergency Counsel Bypass Protocol
Chambers partners or counsel traveling internationally for arbitration (e.g. London LCIA, Paris ICC, Geneva WIPO) may bypass the geo-block using their verified Chambers Counsel Token (`BBB-AFRICA-CHAMBERS-2026`) directly through the Jurisdiction Shield interface.
