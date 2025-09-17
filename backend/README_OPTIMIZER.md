# Optimizer Service Integration

Set `OPTIMIZER_URL` in environment (default `http://localhost:8000`). The backend proxies:

- POST `/api/optimize/waste-routing`
- POST `/api/optimize/energy-balance`

Payloads are forwarded to the Python FastAPI service.

