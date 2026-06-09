# Solucimob Config - Technical Specification

> Real estate configuration microservice providing valor/m² (price per square meter) via REST API.
> Built with TypeScript + Express + Mongoose, with service discovery, structured logging, and OpenAPI docs.

## Executive Summary

Solucimob Config is a **Node.js microservice** (TypeScript + Express + Mongoose) that acts as a configuration provider for the "Solução Imobiliária" real estate suite. It exposes a single `GET /config` endpoint returning the current `valorM2` (price per m²), stored in MongoDB. The service features abstract base classes for Router/Service/Schema/DTO, a `ServiceDiscovery` pattern for inter-service calls, environment-based configuration (dev/prod/test), structured Winston logging, and CI/CD via BitBucket Pipelines + Travis CI.

---

## 1. Problem Statement

### Context
The "Solução Imobiliária" suite needs a centralized configuration service to manage dynamic values (like real estate prices) that other services (e.g., `solucimob-calc`) consume at runtime without redeployment.

### Goals
- Expose current `valorM2` via REST API
- Enable other services to fetch config values dynamically
- Abstract common patterns into reusable base classes (Router, Service, Schema, DTO)
- Environment-based configuration (development/production/test)

### Success Metrics
- [x] `GET /config` endpoint returning `{ valorM2: number }`
- [x] MongoDB persistence via Mongoose
- [x] Abstract Router/Service/Schema/DTO base classes
- [x] Environment-aware config (dev/prod/test)
- [x] Winston structured logging (per environment)
- [x] ServiceDiscovery for inter-service HTTP calls
- [x] OpenAPI 3.0 spec (`api-schema.yml`)
- [x] BitBucket Pipelines + Travis CI

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | TypeScript | 4.1.5 |
| Runtime | Node.js | LTS |
| Framework | Express | 4.17.1 |
| Database | MongoDB (Mongoose) | 5.11.15 |
| ORM | Mongoose | 5.11.15 |
| HTTP Client | Axios | 0.21.1 |
| Logging | Winston | 3.3.3 |
| API Docs | Swagger UI (yaml) | 4.1.6 |
| Testing | Jest | 26.6.3 |
| Build | Babel + tsc | Latest |
| CI | BitBucket Pipelines + Travis CI | - |

---

## 3. Architecture

```
HTTP Client → GET /config
                ↓
           Express Router
           (ConfigRouter extends Router)
                ↓
           ConfigService extends Service
                ↓
           ConfigSchema extends Schema (Mongoose)
                ↓
           MongoDB (in-memory for tests: mongodb-memory-server)

ServiceDiscovery ← (used by other services to call this)
ApiClient (Axios wrapper)
LoggerService (Winston, env-aware)
```

---

## 4. Module Structure

```
src/
  Server.ts                    # Express app bootstrap
  routes/
    Router.ts                  # Root router registration
    api/
      ConfigRouter.ts          # GET /config endpoint
  services/
    ConfigService.ts           # Business logic (fetch config from MongoDB)
  schemas/
    ConfigSchema.ts            # Mongoose schema for Config model
    Schemas.ts                 # Schema registry
  config/
    AppLoader.ts               # Express middleware setup (cors, helmet, morgan, etc.)
    DatabaseConnect.ts         # Mongoose connection
    ErrorHandler.ts            # Global error handler
    ResponseHandler.ts         # Standard response format
    ModelFactoryLoader.ts      # Model registration
    DateUtils.ts               # Date utilities
    InitConfig.ts              # App initialization
    logger/
      LoggerService.ts         # Winston logger factory
      config/                  # Per-environment log configs (dev/prod/test)
  commons/
    ApiClient.ts               # Axios-based HTTP client (for inter-service calls)
    ServiceDiscovery.ts        # Discovers other services by enum
    ModelFactory/              # Dynamic model creation wrapper
  abstracts/
    Router.ts                  # Abstract base class for routers
    Service.ts                 # Abstract base class for services
    Schema.ts                  # Abstract base class for schemas
    DTO.ts                     # Abstract base class for DTOs
  enums/
    Service.enum.ts            # Known services in the suite (CONFIG, CALC)
  env/
    index.ts / development.ts / production.ts / test.ts
  errors/
    AuthError.ts               # Custom auth error
```

---

## 5. API Endpoints

```
GET /config    → Returns active config
```

**Response:**
```json
{
  "valorM2": 1500.00
}
```

OpenAPI spec: `api-schema.yml`

---

## 6. Data Models

```typescript
// Config (Mongoose Schema)
{
  valorM2: Number   // Required — price per square meter
}
```

---

## 7. Testing Strategy

```bash
npm test    # Jest with mongodb-memory-server (in-memory MongoDB)
```

Tests: `ConfigRouter.spec.ts`, `ServiceDiscovery.spec.ts`, type specs.

---

## 8. Deployment & Operations

```bash
npm run dev          # ts-node-dev hot-reload
npm run build        # Babel transpile to dist/
npm start            # node dist/Server.js
npm run start:lw     # Low-memory mode (920MB heap limit)
npm run start:xlw    # Extra low-memory mode (460MB heap limit)
```

**CI:** BitBucket Pipelines (`bitbucket-pipelines.yml`) + Travis CI (`.travis.yml`)  
**Hosting:** Heroku (Procfile: `web: npm start`)  
**Port:** 3000 (default)

---

## 9. Issues Found

### Dependencies
- **Mongoose 5.11.15 is severely outdated** (current is 8.x) — lacks TypeScript improvements, performance fixes, and security patches.
- **Axios 0.21.1 is outdated** — current is 1.x. The 0.x series has multiple CVEs.
- **Express 4.17.1** — still maintained but 5.x is available with async error handling.
- **TypeScript 4.1.5** — current is 5.x.

### Design
- **`mongodb-memory-server` is a production dependency** (not devDependency) — it downloads a MongoDB binary at install time, bloating production images unnecessarily. Should be moved to `devDependencies`.
- **`ConfigService`** directly accesses `req` and `res` objects in service methods (`async find(req, res)`) — services should not handle HTTP layer concerns. HTTP handling belongs in the router/controller.

### Missing
- No input validation on config update (if PUT endpoint exists).
- No authentication on `GET /config` — any service or external caller can read pricing config.
