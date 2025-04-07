import eel
import sys, os
import json
import requests
from tkinter import Tk
from tkinter.filedialog import askdirectory
from utils import *

__version__ = "0.0.4"

# Resources
def resource_path(relative_path=""):
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

@eel.expose
def app_version(): return __version__

@eel.expose
def load_settings():
	path = os.path.join(local(), "settings.json")
	if os.path.exists(path):
		with open(path, 'r', encoding='utf-8') as f:
			return json.loads(f.read())

@eel.expose
def check_updates():
	r = requests.get('https://api.github.com/repos/SuperZombi/wot-modpack/releases/latest')
	if r.ok:
		remote_version = Version(r.json()['tag_name'])
		current_version = Version(__version__)
		return remote_version > current_version

modslistapi = Mod("me.poliroid.modslistapi", [{
	"url": resource_path(os.path.join("mods", "me.poliroid.modslistapi.wotmod")),
	"dest": "mods"
}])
modssettingsapi = Mod("izeberg.modssettingsapi", [{
	"url": resource_path(os.path.join("mods", "izeberg.modssettingsapi.wotmod")),
	"dest": "mods"
}], requires=[modslistapi])
dependencies = {
	"modslistapi": modslistapi,
	"modssettingsapi": modssettingsapi
}

###
@eel.expose
def get_clients():
	clients = list(map(Client, Launchers().get_clients()))
	return json.loads(json.dumps(clients, default=Client.to_json))

@eel.expose
def get_client_info_by_path(path):
	try: return Client(path).to_json()
	except: return

@eel.expose
def request_custom_client():
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	folder = askdirectory(parent=root)
	if folder:
		try: return Client(os.path.normpath(folder)).to_json()
		except: return

@eel.expose
def load_mods_info():
	try:
		r = requests.get('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
		if r.ok:
			return json.loads(r.content.decode())
	except:
		return


def download_progress(current, total):
	eel.installing_progress({"download_progress":round(current / total * 100)})

def json_to_mod(data):
	id = data.get('id')
	files = data.get('files')
	requires = data.get('requires', [])
	requirements = []
	if len(requires) > 0:
		for req in requires:
			mod = dependencies[req]
			if mod: requirements.append(mod)
	return Mod(id, files, requirements)


@eel.expose
def main_install(client_path, args, mods):
	fails = []
	client = Client(client_path)
	if client.is_running:
		fails.append("The client is running. Please shut it down and try again.")
		return fails
	if args.get("delete_mods", False):
		try:
			client.delete_mods(args.get("delete_configs", False))
		except Exception as e:
			fails.append(str(e))
			return fails
	
	if len(mods) > 0:
		mods_arr = list(map(json_to_mod, mods))
		total_mods = len(mods_arr)
		for index, mod in enumerate(mods_arr):
			eel.installing_progress({
				"id": mod.id,
				"current": index,
				"total": total_mods,
				"download_progress": 0
			})
			result = client.install_mod(mod, on_progress=download_progress)
			if not result: fails.append(mod.id)

	if args.get("save_selected_mods", True):
		mods_ids = list(map(lambda x: x.get('id'), mods))
		SETTINGS = {
			"lang": args.get('language'),
			"client": client_path,
			"mods": mods_ids
		}
		with open(os.path.join(local(), "settings.json"), 'w', encoding="utf-8") as f:
			f.write(json.dumps(SETTINGS, indent=4, ensure_ascii=False))

	return fails


# MAIN
eel.init(resource_path("web"))
browsers = ['chrome', 'edge', 'default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser, size=(1000, 800), port=0)
		break
	except Exception: None
