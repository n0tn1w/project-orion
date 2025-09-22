from tusclient import client
from pathlib import Path
import os, time, mimetypes

API_URL = "http://localhost:5000/files/tus"

FILES_TO_UPLOAD = [
    Path(__file__).resolve().parent / "notes.txt",
    Path(__file__).resolve().parent / "other.txt",
]

for fname in FILES_TO_UPLOAD:
    FILE_PATH = fname
    ctype = mimetypes.guess_type(FILE_PATH.name)[0] or "application/octet-stream"
    size = os.path.getsize(FILE_PATH)
    c = client.TusClient(API_URL)
    u = c.uploader(
        file_path=str(FILE_PATH),
        chunk_size=160*1024*1024,
        metadata={
            "filename": FILE_PATH.name,
            "contentType": ctype
        }
    )
    t0 = time.time()
    u.upload()
    t1 = time.time()

    secs = t1 - t0
    mb = size / (1024*1024)
    mbps = mb / secs if secs > 0 else 0

    print(f"Uploaded {FILE_PATH.name}: {mb:.1f} MiB in {secs:.2f}s ({mbps:.2f} MiB/s)")
