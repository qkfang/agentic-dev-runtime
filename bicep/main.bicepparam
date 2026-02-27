using './main.bicep'

param baseName = 'agentdevruntime'
param location = 'eastus'
param environment = 'dev'
param additionalTags = {
  owner: 'platform-team'
  costCenter: 'engineering'
}
