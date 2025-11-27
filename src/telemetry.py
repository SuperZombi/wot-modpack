import requests

def send_telemetry(mod_ids: list[str], modpack_ver: str, wot_ver: str, wot_type: str):
    FORM_ID = "1FAIpQLSfC97X60xa_K9GkqmNKu3bKfq0cMWNZeDRDYGTSN6w5EuWS2w"
    FORM_ENDPOINT = f"https://docs.google.com/forms/d/e/{FORM_ID}/formResponse"
    FORM_REFERER = f"https://docs.google.com/forms/d/e/{FORM_ID}/viewform"

    MOD_IDS_ENTRY = "entry.791868958"
    MODPACK_VER_ENTRY = "entry.303324332"
    WOT_VER_ENTRY = "entry.1583337109"
    WOT_TYPE = "entry.1269265634"

    data = {
        MOD_IDS_ENTRY: str(",".join(mod_ids)),
        MODPACK_VER_ENTRY: str(modpack_ver),
        WOT_VER_ENTRY: str(wot_ver),
        WOT_TYPE: str(wot_type)
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
