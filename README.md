# JSON Dynamic Resolver

A clean-room TypeScript implementation of a dynamic JSON rule engine for model/form configuration.

It lets you keep static JSON schemas while applying runtime logic via declarative `optionsIf` rules (similar in spirit to document-query semantics).

## Why this project exists

This repo is designed as a public, shareable showcase of a common engineering pattern:

- Define handles/params in JSON
- Attach conditional rule blocks (`optionsIf`)
- Resolve final runtime config from user/form state

No proprietary source code is included.
All example data in this repo is fictional and domain-neutral.

## Supported rule semantics

Inside `when`, the engine supports:

- `has`: key exists and is non-empty
- `equals`: strict value match
- `in`: value is in a provided list
- `where`: operator clauses (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, `exists`)
- `and`, `or`, `not`: boolean composition

Each matching rule applies a `set` patch in order.

## Example rule

```json
{
  "optionsIf": [
    {
      "when": { "has": "incidentAttachment" },
      "set": { "visible": false }
    },
    {
      "when": {
        "equals": { "key": "priority", "value": "P1" }
      },
      "set": {
        "default": "1h",
        "options": [{ "label": "1h", "value": "1h" }]
      }
    }
  ]
}
```

## Before/after snapshots (fictional data)

### Snapshot A: Incident routing

#### Before (schema excerpt)

```json
{
  "key": "rollbackPlan",
  "type": "textarea",
  "required": false,
  "visible": false,
  "optionsIf": [
    {
      "when": {
        "equals": {
          "key": "incidentType",
          "value": "network"
        }
      },
      "set": {
        "visible": true,
        "required": true
      }
    }
  ]
}
```

#### Runtime state

```json
{
  "incidentType": "network",
  "priority": "P1",
  "customerImpact": true,
  "pagerDutyService": "core-platform"
}
```

#### After (resolved excerpt)

```json
{
  "key": "rollbackPlan",
  "type": "textarea",
  "required": true,
  "visible": true
}
```

### Snapshot B: Shipment quote workflow

#### Before (schema excerpt)

```json
{
  "key": "insuranceProvider",
  "type": "dropdown",
  "required": false,
  "visible": false,
  "optionsIf": [
    {
      "when": {
        "where": [
          { "key": "declaredValue", "op": "gte", "value": 10000 }
        ]
      },
      "set": {
        "visible": true,
        "required": true
      }
    }
  ]
}
```

#### Runtime state

```json
{
  "destinationCountry": "BR",
  "transportMode": "air",
  "isHazmat": true,
  "declaredValue": 25000
}
```

#### After (resolved excerpt)

```json
{
  "key": "insuranceProvider",
  "type": "dropdown",
  "required": true,
  "visible": true
}
```

## Quick start

```bash
pnpm install
pnpm run demo
pnpm run build
```

## Project structure

- `src/condition.ts`: condition evaluator
- `src/resolver.ts`: recursive resolver + patch application
- `src/fixtures.ts`: fictional sample configs
- `src/demo.ts`: demo execution

## Usage

```ts
import { resolveModelConfig } from "./src/resolver.js";

const resolved = resolveModelConfig(modelJson, {
  transportMode: "air",
  declaredValue: 25000,
});
```

`resolved` is a deep-cloned, runtime-adjusted configuration with matching `optionsIf` patches applied.

## Notes for recruiters

This repo demonstrates:

- Rule-driven runtime config transformation
- Declarative JSON DSL design
- Deterministic ordered patching
- TypeScript implementation with clear, reusable resolver logic
