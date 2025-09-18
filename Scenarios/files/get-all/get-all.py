import requests

API_URL = "http://localhost:5000/files/get-metadata"

try:
    resp = requests.get(API_URL, timeout=15)
    resp.raise_for_status()

    print("Request OK")
    data = resp.json()

    print("Server returned:")
    for item in data:
        file_id = item.get("fileId")
        file_name = item.get("fileName")
        last_modified = item.get("lastModified")
        print(f"{file_id} - {file_name}, LastModified: {last_modified}")

except requests.HTTPError as e:
    print("Request failed:", e)
    print("Status:", resp.status_code)
    print("Body:", resp.text)
except Exception as e:
    print("Unexpected error:", e)
