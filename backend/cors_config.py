"""CORS origin configuration for the development API.

Set CORS_ORIGINS to a comma-separated list of exact browser origins in production.
Wildcard origins are intentionally rejected when credentials are enabled.
"""
import os
from urllib.parse import urlsplit

DEFAULT_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)


def allowed_cors_origins(value: str | None = None) -> list[str]:
    """Return validated browser origins from CORS_ORIGINS or local defaults."""
    if value is None:
        value = os.environ.get("CORS_ORIGINS", "")
    origins = [part.strip().rstrip("/") for part in value.split(",") if part.strip()]
    if not origins:
        return list(DEFAULT_ORIGINS)

    for origin in origins:
        if origin == "*":
            raise ValueError("CORS_ORIGINS cannot contain '*' with credentialed CORS")
        parsed = urlsplit(origin)
        if (
            parsed.scheme not in ("http", "https")
            or not parsed.netloc
            or parsed.username is not None
            or parsed.password is not None
            or parsed.path
            or parsed.query
            or parsed.fragment
        ):
            raise ValueError(f"Invalid CORS origin: {origin!r}; use scheme://host[:port]")
    return list(dict.fromkeys(origins))
