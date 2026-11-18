"""Regression tests for explicit CORS origins; no FastAPI/ML imports required."""
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cors_config import DEFAULT_ORIGINS, allowed_cors_origins


class CorsOriginTests(unittest.TestCase):
    def test_default_local_frontends(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(allowed_cors_origins(), list(DEFAULT_ORIGINS))

    def test_configured_https_origins_are_trimmed_and_deduplicated(self):
        self.assertEqual(
            allowed_cors_origins(" https://app.example.com/, http://localhost:3000,https://app.example.com "),
            ["https://app.example.com", "http://localhost:3000"],
        )

    def test_rejects_wildcard_with_credentials(self):
        with self.assertRaises(ValueError):
            allowed_cors_origins("https://app.example.com,*")

    def test_rejects_paths_query_and_bad_schemes(self):
        for value in ("https://app.example.com/path", "https://app.example.com?q=1", "file:///tmp", "example.com"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                allowed_cors_origins(value)

    def test_environment_override(self):
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://app.example.com"}):
            self.assertEqual(allowed_cors_origins(), ["https://app.example.com"])


if __name__ == "__main__":
    unittest.main()
