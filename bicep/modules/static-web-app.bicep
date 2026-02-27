@description('The name of the Static Web App')
param name string

@description('Azure region for the resource')
param location string

@description('Resource tags')
param tags object = {}

@description('SKU for the Static Web App')
@allowed(['Free', 'Standard'])
param sku string = 'Free'

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
  }
}

@description('The default hostname of the Static Web App')
output defaultHostname string = staticWebApp.properties.defaultHostname

@description('The resource ID of the Static Web App')
output id string = staticWebApp.id

@description('The name of the Static Web App')
output name string = staticWebApp.name
