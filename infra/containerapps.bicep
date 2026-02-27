// ============================================================
//  Paynexus — Container Apps Environment + App Definitions
//
//  Apps deployed:
//    paynexus-api  — Rust/Axum payment backend  (port 8080)
//    paynexus-mcp  — Node.js MCP server         (port 8080)
//
//  Both use:
//    CPU:         0.25 vCPU
//    Memory:      0.5 Gi
//    minReplicas: 0   (scale to zero)
//    maxReplicas: 1
//    Ingress:     external, HTTPS only
//    Registry:    ghcr.io (GHCR)
// ============================================================
targetScope = 'resourceGroup'

param location string
param environmentTag string

// Log Analytics (from loganalytics.bicep outputs)
param logAnalyticsWorkspaceId string
@secure()
param logAnalyticsWorkspaceKey string

// GHCR credentials
param ghcrUsername string
@secure()
param ghcrToken string

// Image tag
param imageTag string

// Supabase config
param supabaseUrl string
@secure()
param supabaseAnonKey string
@secure()
param supabaseJwtSecret string
param supabaseJwksUrl string

// ── Derived names ─────────────────────────────────────────────────────────────
var envName         = 'cae-paynexus-${environmentTag}'
var apiAppName      = 'paynexus-api'
var mcpAppName      = 'paynexus-mcp'
var ghcrServer      = 'ghcr.io'
var apiImage        = '${ghcrServer}/${ghcrUsername}/paynexus-api:${imageTag}'
var mcpImage        = '${ghcrServer}/${ghcrUsername}/paynexus-mcp:${imageTag}'

// ── Container Apps Environment (Consumption) ─────────────────────────────────
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: envName
  location: location
  tags: {
    project: 'paynexus'
    environment: environmentTag
  }
  properties: {
    // Consumption plan — no dedicated workload profile
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspaceId
        sharedKey: logAnalyticsWorkspaceKey
      }
    }
    // No VNet for hackathon
    vnetConfiguration: {
      internal: false
    }
    zoneRedundant: false
  }
}

// ── paynexus-api (Rust/Axum backend) ─────────────────────────────────────────
resource paynexusApi 'Microsoft.App/containerApps@2023-05-01' = {
  name: apiAppName
  location: location
  tags: {
    project: 'paynexus'
    component: 'api'
    environment: environmentTag
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      // ── Ingress ────────────────────────────────────────────
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      // ── Registry ───────────────────────────────────────────
      registries: [
        {
          server: ghcrServer
          username: ghcrUsername
          passwordSecretRef: 'ghcr-token'
        }
      ]
      // ── Secrets ────────────────────────────────────────────
      secrets: [
        {
          name: 'ghcr-token'
          value: ghcrToken
        }
        {
          name: 'supabase-anon-key'
          value: supabaseAnonKey
        }
        {
          name: 'supabase-jwt-secret'
          value: supabaseJwtSecret
        }
      ]
      activeRevisionsMode: 'Single'
    }
    template: {
      containers: [
        {
          image: apiImage
          name: apiAppName
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'SUPABASE_URL'
              value: supabaseUrl
            }
            {
              name: 'SUPABASE_ANON_KEY'
              secretRef: 'supabase-anon-key'
            }
            {
              name: 'SUPABASE_JWT_SECRET'
              secretRef: 'supabase-jwt-secret'
            }
            {
              name: 'SUPABASE_JWKS_URL'
              value: supabaseJwksUrl
            }
            {
              name: 'RUST_LOG'
              value: 'info'
            }
            {
              name: 'PORT'
              value: '8080'
            }
          ]
          // Health probe — Axum /api/health endpoint
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 8080
              }
              initialDelaySeconds: 5
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 8080
              }
              initialDelaySeconds: 3
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        // Scale up on HTTP requests
        rules: [
          {
            name: 'http-scale'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

// ── paynexus-mcp (Node.js MCP server) ────────────────────────────────────────
resource paynexusMcp 'Microsoft.App/containerApps@2023-05-01' = {
  name: mcpAppName
  location: location
  tags: {
    project: 'paynexus'
    component: 'mcp'
    environment: environmentTag
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: ghcrServer
          username: ghcrUsername
          passwordSecretRef: 'ghcr-token'
        }
      ]
      secrets: [
        {
          name: 'ghcr-token'
          value: ghcrToken
        }
        {
          name: 'supabase-anon-key'
          value: supabaseAnonKey
        }
      ]
      activeRevisionsMode: 'Single'
    }
    template: {
      containers: [
        {
          image: mcpImage
          name: mcpAppName
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'SUPABASE_URL'
              value: supabaseUrl
            }
            {
              name: 'SUPABASE_ANON_KEY'
              secretRef: 'supabase-anon-key'
            }
            {
              name: 'SUPABASE_JWKS_URL'
              value: supabaseJwksUrl
            }
            {
              name: 'PAYNEXUS_BACKEND_URL'
              // MCP calls the API container app internally
              value: 'https://${paynexusApi.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'PORT'
              value: '8080'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        rules: [
          {
            name: 'http-scale'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [paynexusApi]
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output apiFqdn string = paynexusApi.properties.configuration.ingress.fqdn
output mcpFqdn string = paynexusMcp.properties.configuration.ingress.fqdn
output containerAppsEnvId string = containerAppsEnv.id
