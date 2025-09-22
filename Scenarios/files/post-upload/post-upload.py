import requests
from pathlib import Path
import mimetypes
import time
import json
from contextlib import ExitStack

API_URL = "http://localhost:5000/files/upload"

FILES_TO_UPLOAD = [
    "notes.txt",
    "other.txt",
]

def guess_mime(path: Path) -> str:
    return mimetypes.guess_type(path.name)[0] or "application/octet-stream"

base_dir = Path(__file__).resolve().parent
paths = [base_dir / fname for fname in FILES_TO_UPLOAD]

total_size = sum(p.stat().st_size for p in paths)
t0 = time.time()

with ExitStack() as stack:
    file_handles = [stack.enter_context(open(p, "rb")) for p in paths]
    files = [
        ("Files", (p.name, fh, guess_mime(p)))
        for p, fh in zip(paths, file_handles)
    ]

    resp = requests.post(API_URL, files=files, timeout=600)

resp.raise_for_status()

try:
    data = resp.json()
    print("Server response:")
    print(json.dumps(data, indent=2))
except ValueError:
    print("Server response (raw):", resp.text)

secs = time.time() - t0
mb = total_size / (1024 * 1024)
print(f"Sent {len(paths)} file(s), {mb:.2f} MiB in {secs:.2f}s")
