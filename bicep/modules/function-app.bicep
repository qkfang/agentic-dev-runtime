@description('The name of the Function App')
param name string

@description('Azure region for the resource')
param location string

@description('Resource tags')
param tags object = {}

@description('The name of the Storage Account (used by the Function App runtime)')
param storageAccountName string

@description('The name of the consumption-based App Service Plan')
param hostingPlanName string

@description('Node.js version for the runtime stack')
param nodeVersion string = '~20'

@description('App settings (environment variables) for the Function App')
param appSettings array = []

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: hostingPlanName
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true // required for Linux
  }
}

// NOTE: The storage connection string embeds a storage account key in plain text
// inside app settings. For production workloads, replace this with a Key Vault
// reference (https://learn.microsoft.com/azure/app-service/app-service-key-vault-references)
// or use a managed identity with 'AzureWebJobsStorage__accountName' instead.
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'

var baseAppSettings = [
  {
    name: 'AzureWebJobsStorage'
    value: storageConnectionString
  }
  {
    name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
    value: storageConnectionString
  }
  {
    name: 'WEBSITE_CONTENTSHARE'
    value: toLower(name)
  }
  {
    name: 'FUNCTIONS_EXTENSION_VERSION'
    value: '~4'
  }
  {
    name: 'FUNCTIONS_WORKER_RUNTIME'
    value: 'node'
  }
  {
    name: 'WEBSITE_NODE_DEFAULT_VERSION'
    value: nodeVersion
  }
]

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: name
  location: location
  tags: tags
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    siteConfig: {
      appSettings: concat(baseAppSettings, appSettings)
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}

@description('The default hostname of the Function App')
output defaultHostname string = functionApp.properties.defaultHostName

@description('The resource ID of the Function App')
output id string = functionApp.id

@description('The name of the Function App')
output name string = functionApp.name

@description('The resource ID of the Storage Account')
output storageAccountId string = storageAccount.id
