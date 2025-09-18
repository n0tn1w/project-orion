import requests
from urllib.parse import quote

API_URL = "http://localhost:5000/files/delete"
FILE_NAME = "a.txt"  # change as needed

resp = requests.delete(f"{API_URL}/{quote(FILE_NAME)}", timeout=10)

print(resp.status_code)
try:
    print("Delete successful" if resp.json() else "Failed to delete")
except Exception:
    print(resp.text)
