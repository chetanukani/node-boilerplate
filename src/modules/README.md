# Feature module pattern

Use this when a domain grows beyond a few files. Keep the current flat layout for small modules.

## When to migrate

- 5+ files per domain (routes, validators, controller, service, tests)
- Multiple developers owning the same area
- Domain-specific middleware or utilities

## Recommended structure

```
src/modules/products/
├── product.routes.js
├── product.controller.js
├── product.service.js
├── product.validator.js
├── product.model.js
└── __tests__/
    └── product.test.js
```

## Wiring in `app.js`

```javascript
import productRouter from "./modules/products/product.routes.js";

app.use("/api/v1/products", productRouter);
```

## Rules

1. **Validators** stay Zod-based; use shared helpers from `src/validators/common.validator.js` or move shared helpers to `src/validators/`.
2. **Config** — import `env` from `src/config/index.js`, never `process.env` in new code.
3. **Controllers** use `req.validated` after `validateRequest()`.
4. **Services** own business logic and DB access; no `req`/`res` in services.
5. **Cross-module calls** go through services, not direct model imports from other modules.

## Current vs modular

| Size | Layout |
|------|--------|
| Small (now) | `src/routes`, `src/controllers`, `src/validators` |
| Large team | `src/modules/<domain>/` colocated |

Migrate one module at a time; do not big-bang refactor.
