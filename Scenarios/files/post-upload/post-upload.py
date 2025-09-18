import requests
from pathlib import Path
import os, time, mimetypes

API_URL = "http://localhost:5000/files/upload"
FILE_PATH = Path(__file__).resolve().parent / "notes.txt"

size = os.path.getsize(FILE_PATH)
filename = FILE_PATH.name
content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"

t0 = time.time()

with open(FILE_PATH, "rb") as f:
    files = {
        "FileStream": (filename, f, content_type)
    }
    resp = requests.post(API_URL, files=files, timeout=600)

resp.raise_for_status()
print("Upload OK")
print("Server response:", resp.text)

secs = time.time() - t0
mb = size / (1024 * 1024)
mbps = mb / secs if secs > 0 else 0
print(f"Upload OK: {mb:.1f} MiB in {secs:.2f}s ({mbps:.2f} MiB/s)")
