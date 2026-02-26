#!/bin/bash
# Start FruityVision AI backend
cd "$(dirname "$0")/backend"
echo "Starting backend at http://localhost:8000"
echo "API docs: http://localhost:8000/docs"
python3 main.py
