# Solucimob Config - Technical Specification

> Technical specification for the Solucimob Configuration Management Microservice.
> Reference for understanding configuration service patterns and tenant management.

## Executive Summary

- **Project**: Solucimob Config (Configuration Microservice)
- **Type**: Node.js REST Microservice
- **Language**: JavaScript (Node.js 18+)
- **Framework**: Express.js
- **Status**: Active Development
- **Owner**: Development team

---

## 1. Problem Statement

### Context
Solucimob Config manages global tenant configurations, business rules, and system parameters for the real estate platform. It has no external dependencies and serves as the single source of truth for configuration data.

### Goals
- **Primary**: Centralize configuration and rule management
- **Secondary**: Provide dynamic configuration updates without service restarts
- **Tertiary**: Support multi-tenant configuration isolation

### Success Metrics
- [x] REST API for configuration management
- [x] Multi-tenant support with isolation
- [x] No external service dependencies
- [x] Docker containerization
- [x] Health check endpoint
- [x] Configuration versioning and history
- [ ] Real-time configuration updates via WebSockets
- [ ] >85% test coverage

---

## 2. Technology Stack

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Runtime | Node.js | 18.0+ | Server-side JavaScript |
| Framework | Express.js | 4.18+ | Lightweight web framework |
| Database | MongoDB Atlas | Latest | Configuration data store |
| Caching | Redis (optional) | Latest | Configuration caching layer |
| Testing | Jest | 27.0+ | Testing framework |
| Docs | Swagger/JSDoc | 3.0 | API documentation |

### Key Dependencies
- `express`: HTTP server framework
- `dotenv`: Environment variable management
- `joi`: Schema validation
- `jest`: Testing framework (dev)

---

## 3. Architecture

### Configuration Service Architecture

```
┌────────────────────────────────────────────┐
│       Express HTTP Layer                   │
│  GET /health, GET/POST /api/config         │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│     Controller Layer                         │
│  (Request validation, response formatting)   │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│     Service Layer                            │
│  (Configuration management & rules)          │
└────────────────────┬─────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────────┐              ┌──────────────┐
│ Repository   │              │ Cache Layer  │
│ (MongoDB)    │              │ (Redis)      │
└──────────────┘              └──────────────┘
    │                                 │
    ▼                                 ▼
  MongoDB                     Redis Cache
  Atlas                       (optional)
```

### Configuration Categories
```
Valuation Rules       - Property evaluation methods
Tax Parameters        - Tax calculation rules
Commission Rules      - Agent commission structure
Feature Flags         - Feature enable/disable
Thresholds            - Business limits and boundaries
```

---

## 4. Project Structure

```
src/
├── index.js                  # Entry point
├── config/
│   └── database.js          # MongoDB connection
├── routes/
│   ├── health.js            # Health check
│   ├── config.js            # Configuration endpoints
│   └── rules.js             # Business rules endpoints
├── controllers/
│   ├── configController.js
│   └── rulesController.js
├── services/
│   ├── configService.js      # Config management
│   ├── rulesService.js       # Rule management
│   └── cacheService.js       # Caching layer
├── models/
│   ├── Config.js            # MongoDB schema
│   ├── Rule.js              # Rule schema
│   └── Tenant.js            # Multi-tenant data
├── middleware/
│   ├── errorHandler.js
│   ├── validation.js
│   └── tenantMiddleware.js  # Multi-tenant isolation
└── utils/
    └── validators.js        # Joi schemas

test/
├── unit/
│   └── configService.test.js
└── integration/
    └── configAPI.test.js

.env.example
.eslintrc.json
jest.config.js
package.json
```

---

## 5. Key Endpoints

### Health
```
GET /health
  Response: { status: 'ok', service: 'config' }
```

### Configuration
```
GET /api/config/:tenant/:category
  Response: { configuration: {...} }

POST /api/config/:tenant/:category
  Body: { settings: {...} }
  Response: { success: true, configuration: {...} }

PUT /api/config/:tenant/:category
  Body: { settings: {...} }
  Response: { success: true, configuration: {...} }

DELETE /api/config/:tenant/:category
  Response: { success: true }
```

### Rules
```
GET /api/rules/valuation
  Response: { rules: {...} }

GET /api/rules/commission
  Response: { rules: {...} }

POST /api/rules/:ruleType
  Body: { rule: {...} }
  Response: { success: true }
```

---

## 6. Multi-Tenant Support

### Tenant Isolation

```javascript
// Configuration is scoped to tenant
GET /api/config/:tenantId/valuation-rules

// Each tenant has isolated configuration
{
  "tenant-1": { "rules": {...} },
  "tenant-2": { "rules": {...} }
}
```

---

## 7. Configuration Schema

### Example: Valuation Rules

```json
{
  "tenant": "tenant-1",
  "category": "valuation",
  "rules": {
    "comparableMethod": {
      "weight": 0.6,
      "minComps": 3,
      "radiusKm": 5
    },
    "costMethod": {
      "weight": 0.2,
      "depreciationRate": 0.03
    },
    "incomeMethod": {
      "weight": 0.2,
      "capRate": 0.05
    }
  },
  "version": 1,
  "updatedAt": "2024-06-01T12:00:00Z",
  "createdBy": "admin"
}
```

