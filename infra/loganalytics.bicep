// ============================================================
//  Paynexus — Log Analytics Workspace
//  Feeds structured logs into the Container Apps environment.
// ============================================================
targetScope = 'resourceGroup'

param location string
param environmentTag string

// ── Workspace ─────────────────────────────────────────────────────────────────
resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'law-paynexus-${environmentTag}'
  location: location
  tags: {
    project: 'paynexus'
    environment: environmentTag
  }
  properties: {
    sku: {
      name: 'PerGB2018'   // pay-per-GB — cheapest for hackathon
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ── Outputs consumed by containerapps.bicep ───────────────────────────────────
output workspaceId string = workspace.properties.customerId
output workspaceKey string = workspace.listKeys().primarySharedKey
output workspaceName string = workspace.name
