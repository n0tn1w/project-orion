from tusclient import client
from pathlib import Path

import os, time, mimetypes

API_URL = "http://localhost:5000/files/tus"
#FILE_PATH = r"C:\Users\somed\Videos\Screen Recordings\Screen Recording 2025-03-21 140531.mp4"
FILE_PATH = Path(__file__).resolve().parent / "notes.txt"

ctype = mimetypes.guess_type(FILE_PATH)[0] or "application/octet-stream"
size = os.path.getsize(FILE_PATH)
c = client.TusClient(API_URL)
u = c.uploader(
    file_path=FILE_PATH,
    chunk_size=160*1024*1024,
    metadata={
        "filename": os.path.basename(FILE_PATH),
        "contentType": ctype
    }
)
t0 = time.time()
u.upload()
t1 = time.time()

secs = t1 - t0
mb = size / (1024*1024)
mbps = mb / secs if secs > 0 else 0

print(f"Upload OK: {mb:.1f} MiB in {secs:.2f}s ({mbps:.2f} MiB/s)")
