@description('The name of the Web App')
param name string

@description('Azure region for the resource')
param location string

@description('Resource tags')
param tags object = {}

@description('The name of the App Service Plan')
param appServicePlanName string

@description('Node.js version for the runtime stack')
param nodeVersion string = 'NODE|20-lts'

@description('SKU for the App Service Plan')
param skuName string = 'B1'

@description('App settings (environment variables) for the Web App')
param appSettings array = []

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: skuName
  }
  properties: {
    reserved: true // required for Linux
  }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: nodeVersion
      appSettings: appSettings
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}

@description('The default hostname of the Web App')
output defaultHostname string = webApp.properties.defaultHostName

@description('The resource ID of the Web App')
output id string = webApp.id

@description('The name of the Web App')
output name string = webApp.name

@description('The resource ID of the App Service Plan')
output appServicePlanId string = appServicePlan.id
