# Browser CORS configuration

The FastAPI backend uses explicit origins for browser requests with credentials.

## Local development

By default, the following frontend origins are permitted:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

No configuration is necessary when running the Next.js app locally on port 3000.

## Deployment

Set `CORS_ORIGINS` to the exact public URLs hosting the frontend:

```bash
export CORS_ORIGINS="https://app.example.com,https://admin.example.com"
```

Each entry must contain an `http://` or `https://` scheme and a host (optional port), with **no URL path or query string**. A trailing slash is accepted and removed. Wildcard `*` origins are rejected because credentialed requests are enabled.

The server raises `ValueError` during startup if the variable is invalid. Add deployment URLs explicitly rather than switching back to `allow_origins=["*"]`.

## Run regression tests

The configuration tests use only Python's standard library:

```bash
python -m unittest discover -s backend/tests -p "test_cors_config.py" -v
```

These tests validate the origin parser. They do not replace end-to-end browser authentication or deployment testing.
