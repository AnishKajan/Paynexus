// ============================================================
//  Paynexus — Main Bicep Entry Point
//  Target scope : resourceGroup (rg already exists: Paynexus)
//  Region       : East US 2
//  Usage:
//    az deployment group create \
//      --resource-group Paynexus \
//      --template-file infra/main.bicep \
//      --parameters @infra/params.json
// ============================================================
targetScope = 'resourceGroup'

// ── Parameters ───────────────────────────────────────────────────────────────
@description('Azure region for all resources.')
param location string = 'eastus2'

@description('Short environment tag appended to resource names (e.g. prod, staging).')
param environmentTag string = 'prod'

@description('GitHub Container Registry username (github.com/<username>).')
param ghcrUsername string

@description('GHCR PAT with read:packages scope. Stored as a Container App secret.')
@secure()
param ghcrToken string

@description('Tag of the container images to deploy.')
param imageTag string = 'latest'

// ── Supabase environment variables ───────────────────────────────────────────
@description('Supabase project URL.')
param supabaseUrl string

@description('Supabase anon (public) key.')
@secure()
param supabaseAnonKey string

@description('Supabase JWT secret for backend token verification.')
@secure()
param supabaseJwtSecret string

@description('Supabase JWKS URL (https://<ref>.supabase.co/auth/v1/keys).')
param supabaseJwksUrl string

@description('Runtime environment label injected into the container (sandbox or production).')
param paynexusEnv string = 'sandbox'

// ── Log Analytics ─────────────────────────────────────────────────────────────
module logAnalytics 'loganalytics.bicep' = {
  name: 'logAnalyticsDeploy'
  params: {
    location: location
    environmentTag: environmentTag
  }
}

// ── Container Apps ────────────────────────────────────────────────────────────
module containerApps 'containerapps.bicep' = {
  name: 'containerAppsDeploy'
  params: {
    location: location
    environmentTag: environmentTag
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
    logAnalyticsWorkspaceKey: logAnalytics.outputs.workspaceKey
    ghcrUsername: ghcrUsername
    ghcrToken: ghcrToken
    imageTag: imageTag
    supabaseUrl: supabaseUrl
    supabaseAnonKey: supabaseAnonKey
    supabaseJwtSecret: supabaseJwtSecret
    supabaseJwksUrl: supabaseJwksUrl
    paynexusEnv: paynexusEnv
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
@description('Paynexus API public hostname.')
output apiFqdn string = containerApps.outputs.apiFqdn

@description('Paynexus MCP public hostname.')
output mcpFqdn string = containerApps.outputs.mcpFqdn

@description('Full API base URL.')
output apiUrl string = 'https://${containerApps.outputs.apiFqdn}'

@description('Full MCP base URL.')
output mcpUrl string = 'https://${containerApps.outputs.mcpFqdn}'
