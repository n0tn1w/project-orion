import requests

API = "http://localhost:5000/auth/check"
password = "notcorrectpasswordfr" 

resp = requests.post(API, json={"password": password}, timeout=10)
resp.raise_for_status()
ok = resp.json()  
print("Authorized" if ok else "Denied")