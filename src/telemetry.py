import requests

def send_telemetry(
	mod_ids: list[str],
	modpack_ver: str,
	wot_ver: str,
	wot_type: str,
	wot_lang: str,
	wot_realm: str,
	wot_branch: str,
	layout: str,
):
	FORM_ID = "1FAIpQLSfC97X60xa_K9GkqmNKu3bKfq0cMWNZeDRDYGTSN6w5EuWS2w"
	FORM_ENDPOINT = f"https://docs.google.com/forms/d/e/{FORM_ID}/formResponse"
	FORM_REFERER = f"https://docs.google.com/forms/d/e/{FORM_ID}/viewform"

	MOD_IDS = "entry.791868958"
	MODPACK_VER = "entry.303324332"
	WOT_VER = "entry.1583337109"
	WOT_TYPE = "entry.1269265634"
	WOT_LANG = "entry.1724540185"
	WOT_REALM = "entry.1505311192"
	WOT_BRANCH = "entry.1523491408"
	LAYOUT = "entry.951084848"

	data = {
		MOD_IDS: str(",".join(mod_ids)),
		MODPACK_VER: str(modpack_ver),
		WOT_VER: str(wot_ver),
		WOT_TYPE: str(wot_type),
		WOT_LANG: str(wot_lang),
		WOT_REALM: str(wot_realm),
		WOT_BRANCH: str(wot_branch),
		LAYOUT: str(layout) if layout in ["list", "grid"] else "",
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
