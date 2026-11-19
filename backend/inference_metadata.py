"""Metadata contract for image-comparison responses.

A response without a demo_mode flag is not automatically a real prediction.
Only explicitly marked non-demo successful results are dataset-backed.
"""


def annotate_inference_mode(result: dict) -> dict:
    """Return a copy with a conservative, machine-readable inference_mode."""
    output = dict(result)
    if output.get("error"):
        mode = "error"
    elif output.get("demo_mode") is True:
        mode = "demo"
    elif output.get("demo_mode") is False:
        mode = "model"
    else:
        # Older adapters may omit demo_mode; do not imply validated inference.
        mode = "unknown"
    output["inference_mode"] = mode
    return output
