#!/usr/bin/env python3
"""UserPromptSubmit hook: run griddy when prompt contains 'capture'."""
import json
import os
import subprocess
import sys

try:
    data = json.load(sys.stdin)
    prompt = data.get("prompt", "").lower()
    if "capture" in prompt:
        griddy = os.path.expanduser("~/.local/bin/griddy")
        subprocess.Popen([griddy, "--terminals"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
except Exception:
    pass  # never block the prompt
