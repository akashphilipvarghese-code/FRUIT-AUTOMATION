"""Run with: python -m unittest discover -s backend/tests -p 'test_*.py'"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from inference_metadata import annotate_inference_mode


class InferenceMetadataTests(unittest.TestCase):
    def test_demo(self):
        self.assertEqual(annotate_inference_mode({"demo_mode": True})["inference_mode"], "demo")

    def test_model(self):
        self.assertEqual(annotate_inference_mode({"demo_mode": False})["inference_mode"], "model")

    def test_unmarked_adapter_is_unknown(self):
        self.assertEqual(annotate_inference_mode({"confidence": 0.9})["inference_mode"], "unknown")

    def test_error_takes_precedence(self):
        self.assertEqual(annotate_inference_mode({"demo_mode": False, "error": "bad image"})["inference_mode"], "error")

    def test_input_not_mutated(self):
        original = {"demo_mode": True}
        annotate_inference_mode(original)
        self.assertEqual(original, {"demo_mode": True})


if __name__ == "__main__":
    unittest.main()
