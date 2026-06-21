# Node Boilerplate

Production-oriented Express + MongoDB API boilerplate with Zod validation, centralized config, observability hooks, and Docker support.

## Requirements

- Node.js **24+**
- Yarn (project uses `yarn.lock`)
- MongoDB 6+

## Quick start

```bash
cp .env.sample .env
# Edit MONGODB_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET

yarn install
yarn dev
```

Server: `http://localhost:8080`  
Health: `GET /health` | Readiness: `GET /ready` | Metrics: `GET /metrics`

## Scripts

| Script | Description |
|--------|-------------|
| `yarn start` | Production start |
| `yarn dev` | Nodemon dev server |
| `yarn seed` | Seed categories + admin user |
| `yarn lint` | ESLint |
| `yarn format` | Prettier write |

## Configuration

All environment variables are validated at boot via `src/config/index.js`. Import `env` instead of `process.env`:

```javascript
import { env } from "../config/index.js";
```

See [`.env.sample`](./.env.sample) for the full list. Required:

- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

## API examples

- REST Client: [`examples/api.http`](./examples/api.http)
- Postman: import [`examples/postman_collection.json`](./examples/postman_collection.json)

### Route pattern

```
JSON:      validateRequest(validator) → controller
Multipart: multer → validateRequest(validator) → controller
```

Validated data is on `req.validated.body` / `req.validated.params` / `req.validated.query`.

## Error responses

All errors return a consistent shape:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "errors": [{ "field": "body.email", "message": "Email is invalid" }]
}
```

`stack` is included only when `NODE_ENV=development`.

## File uploads

- Local: `public/files/` served at `/files/...`
- S3: set `USE_S3=true` and AWS vars in `.env`

## Observability

- Request ID: `x-request-id` header
- Prometheus metrics at `/metrics` (`METRICS_ENABLED=true`)
- See [`src/observability/README.md`](./src/observability/README.md)

## Scaling the codebase

When domains grow, colocate under `src/modules/<domain>/`. See [`src/modules/README.md`](./src/modules/README.md).

## Docker

```bash
docker build -t node-boilerplate .
docker run --env-file .env -p 8080:8080 node-boilerplate
```

## Seed data

```bash
yarn seed
```

Creates sample categories and `admin@example.com` / `Admin@12345` (if missing).

## Security notes

- `helmet` enabled by default
- Set `TRUST_PROXY=true` behind reverse proxies
- Rate limit: 5000 req / 15 min per IP
- Wire auth middleware on write routes before production

## Project layout

```
src/
├── config/          # Central env (Zod-validated)
├── validators/      # Zod schemas (*.validator.js)
├── middlewares/     # auth, zodValidate, multer, errors
├── routes/
├── controllers/
├── db/models|services/
├── observability/
└── modules/         # Feature-module pattern docs
```
