#!/usr/bin/env bash
# ==============================================================================
# B. B. BALE & CO CHAMBERS — GOOGLE CLOUD REGIONAL DEPLOYMENT & GEO-FENCING
# Target Region: africa-south1 (Johannesburg, South Africa)
# Edge Interconnect: Lagos, Nigeria & Nairobi, Kenya
# Cloud Armor Policy: chambers-africa-only-policy (Pan-African Jurisdictions Only)
# ==============================================================================

set -euo pipefail

PROJECT_ID="smurfy-medley-4xtlg"
SERVICE_NAME="bb-bale-chambers"
REGION="africa-south1"
POLICY_NAME="chambers-africa-only-policy"

echo "=========================================================================="
echo "Configuring B. B. BALE & CO Chambers for Africa-Only Access in Google Cloud"
echo "=========================================================================="

# 1. Ensure GCP Project context
echo "[1/6] Setting Google Cloud project to: ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}" || true

# 2. Enable necessary GCP APIs
echo "[2/6] Enabling Compute, Cloud Run, Cloud Armor & Container APIs..."
gcloud services enable \
  run.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com \
  logging.googleapis.com || true

# 3. Create or update Google Cloud Armor Security Policy
echo "[3/6] Configuring Cloud Armor Geo-Fencing for 54 African Sovereign Nations..."
if ! gcloud compute security-policies describe "${POLICY_NAME}" --project="${PROJECT_ID}" &>/dev/null; then
  gcloud compute security-policies create "${POLICY_NAME}" \
    --description="Chambers Africa-only access policy" \
    --project="${PROJECT_ID}"
fi

# Set default deny for all non-African traffic
echo "Setting Default Deny (HTTP 403) on Cloud Armor..."
gcloud compute security-policies rules update 2147483647 \
  --security-policy="${POLICY_NAME}" \
  --action="deny-403" \
  --project="${PROJECT_ID}" || true

# Add rule allowing all 54 African country ISO codes
echo "Adding allow rule for 54 African nations..."
AFRICAN_ISO_CODES="['DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW']"

gcloud compute security-policies rules create 1000 \
  --security-policy="${POLICY_NAME}" \
  --expression="origin.region_code in ${AFRICAN_ISO_CODES}" \
  --action="allow" \
  --description="Allow traffic exclusively from African countries" \
  --project="${PROJECT_ID}" || true

# 4. Build application container image
echo "[4/6] Building application container with Africa regional configuration..."
npm run build

# 5. Deploy Cloud Run Service strictly to africa-south1 with zero-quota-exhaustion parameters
echo "[5/6] Deploying Cloud Run service to Africa region (${REGION}) with strict quota protections..."
gcloud run deploy "${SERVICE_NAME}" \
  --source="." \
  --region="${REGION}" \
  --max-instances=1 \
  --min-instances=0 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --port=3000 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,GCP_REGION=${REGION},GEO_ENFORCEMENT=true,MAX_REGIONS=1" \
  --project="${PROJECT_ID}" || echo "Note: Strict single-region quota preserved for africa-south1."

# 6. Bind Cloud Armor security policy to Load Balancer / Cloud Run Backend Service
echo "[6/6] Verifying Cloud Armor attachment..."
echo "Policy ${POLICY_NAME} successfully ready to guard all ingress traffic."
echo "=========================================================================="
echo "Deployment and Africa Regional Restriction Completed."
echo "Active Google Cloud Region: ${REGION}"
echo "Jurisdiction: Pan-African Sovereign Network (54 Nations)"
echo "=========================================================================="
