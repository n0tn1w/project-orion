import requests
from pathlib import Path

FILE_NAME = "1372"
url = f"http://localhost:5000/files/download/{FILE_NAME}"

SCRIPT_DIR = Path(__file__).resolve().parent
DOWNLOAD_DIR = SCRIPT_DIR / "download"
DOWNLOAD_DIR.mkdir(exist_ok=True)

out_path = DOWNLOAD_DIR / FILE_NAME

try:
    with requests.get(url, stream=True, timeout=30) as resp:
        resp.raise_for_status()

        cd = resp.headers.get("Content-Disposition") or resp.headers.get("content-disposition")
        if cd and "filename=" in cd:
            name_part = cd.split("filename=", 1)[1].split(";", 1)[0].strip()
            if name_part.startswith('"') and name_part.endswith('"'):
                name_part = name_part[1:-1]
            if name_part:
                out_path = DOWNLOAD_DIR / name_part


        with out_path.open("wb") as f:
            for chunk in resp.iter_content(chunk_size=1024 * 64):
                if chunk:
                    f.write(chunk)

    print("Download OK")
    print("Saved to:", out_path.resolve())

except requests.HTTPError as e:
    print("Download failed:", e)
    print("Status:", resp.status_code if 'resp' in locals() else 'n/a')
    print("Body:", resp.text if 'resp' in locals() else 'n/a')
except requests.RequestException as e:
    print("Request error:", e)
