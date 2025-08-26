import json
import requests


FORM_ID = "1FAIpQLSfC97X60xa_K9GkqmNKu3bKfq0cMWNZeDRDYGTSN6w5EuWS2w"
MOD_IDS_ENTRY = "entry.791868958"

FORM_ENDPOINT = f"https://docs.google.com/forms/d/e/{FORM_ID}/formResponse"
FORM_REFERER = f"https://docs.google.com/forms/d/e/{FORM_ID}/viewform"


def _send_to_form(mod_ids: str):
    data = {
        MOD_IDS_ENTRY: str(mod_ids)
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": FORM_REFERER,
    }
    try:
        r = requests.post(FORM_ENDPOINT, data=data, headers=headers, timeout=8)
        if r.status_code in (200, 302): return True
        print(r)
    except Exception as e:
        print(e)

def submit_selected_mods(mod_ids: list[str]):
    return _send_to_form(
        mod_ids=",".join(mod_ids)
    )
