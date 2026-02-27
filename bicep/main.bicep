@description('Base name used to derive all resource names')
param baseName string = 'agenticdevruntime'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment label (e.g. dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Additional tags applied to every resource')
param additionalTags object = {}

// ── Shared tags ──────────────────────────────────────────────────────────────
var commonTags = union({
  environment: environment
  project: 'agentic-dev-runtime'
}, additionalTags)

// ── Resource name helpers ─────────────────────────────────────────────────────
var prefix = '${baseName}-${environment}'

// ── Frontend: Static Web App ─────────────────────────────────────────────────
module frontend 'modules/static-web-app.bicep' = {
  name: 'deploy-frontend'
  params: {
    name: '${prefix}-frontend'
    location: location
    tags: commonTags
    sku: environment == 'prod' ? 'Standard' : 'Free'
  }
}

// ── Backend: Web App (Control Plane REST API) ────────────────────────────────
module backend 'modules/web-app.bicep' = {
  name: 'deploy-backend'
  params: {
    name: '${prefix}-backend'
    location: location
    tags: commonTags
    appServicePlanName: '${prefix}-backend-plan'
    skuName: environment == 'prod' ? 'P1v3' : 'B1'
    appSettings: [
      {
        name: 'NODE_ENV'
        value: environment
      }
      {
        name: 'FRONTEND_URL'
        value: 'https://${frontend.outputs.defaultHostname}'
      }
    ]
  }
}

// ── Scheduler: Function App ───────────────────────────────────────────────────
module scheduler 'modules/function-app.bicep' = {
  name: 'deploy-scheduler'
  params: {
    name: '${prefix}-scheduler'
    location: location
    tags: commonTags
    // Storage account names must be 3-24 chars, lowercase letters and numbers only.
    // take() ensures the name stays within the 24-character limit.
    storageAccountName: take('${replace(baseName, '-', '')}${environment}sa', 24)
    hostingPlanName: '${prefix}-scheduler-plan'
    appSettings: [
      {
        name: 'NODE_ENV'
        value: environment
      }
      {
        name: 'CONTROL_PLANE_URL'
        value: 'https://${backend.outputs.defaultHostname}'
      }
    ]
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
@description('URL of the frontend Static Web App')
output frontendUrl string = 'https://${frontend.outputs.defaultHostname}'

@description('URL of the backend Web App')
output backendUrl string = 'https://${backend.outputs.defaultHostname}'

@description('URL of the scheduler Function App')
output schedulerUrl string = 'https://${scheduler.outputs.defaultHostname}'
