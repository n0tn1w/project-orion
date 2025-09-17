import requests
from pathlib import Path

API_URL = "http://localhost:5000/files/upload"
#API_URL = "http://192.168.0.4:5000/files/upload"
FILE_PATH = Path(__file__).resolve().parent / "notes.txt"

with FILE_PATH.open("rb") as f:
    files = {
        "FileStream": (FILE_PATH.name, f, "text/plain")
    }
    resp = requests.post(API_URL, files=files, timeout=30)

try:
    resp.raise_for_status()
    print("Upload OK")
    print("Server response:", resp.text)
except requests.HTTPError as e:
    print("Upload failed:", e)
    print("Status:", resp.status_code)
    print("Body:", resp.text)
