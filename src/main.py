import eel
import sys, os
import json
import requests
from tkinter import Tk
from tkinter.filedialog import askdirectory
from utils import *

MODS_DATA = {}
__version__ = "0.0.5"
@eel.expose
def app_version(): return __version__
def resource_path(relative_path=""):
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

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

@eel.expose
def get_cache_size(): return get_folder_size(os.path.join(local(), 'cache'))
@eel.expose
def delete_cache():
	cache_file = os.path.join(local(), 'cache.json')
	cache_folder = os.path.join(local(), 'cache')
	if os.path.exists(cache_file): os.remove(cache_file)
	if os.path.exists(cache_folder): shutil.rmtree(cache_folder)

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
	global MODS_DATA
	try:
		r = requests.get('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
		if r.ok:
			mods_info = json.loads(r.content.decode())
			MODS_DATA = mods_info["mods"]
			return mods_info
	except:
		return


def download_progress(current, total):
	eel.installing_progress({"download_progress":round(current / total * 100)})

def json_to_mod(mod_id):
	mod_info = next((d for d in MODS_DATA if d["id"] == mod_id), None)
	if not mod_info: return

	id = mod_info.get('id')
	files = mod_info.get('files')
	requires = mod_info.get('requires', [])
	version = mod_info.get('ver', None)
	requirements = []
	if len(requires) > 0:
		for req in requires:
			req_mod = json_to_mod(req)
			if req_mod: requirements.append(req_mod)
	return Mod(id, files, requirements, version)


@eel.expose
def main_install(client_path, args, mods):
	fails = []
	client = Client(client_path, use_cache=args.get("use_cache", True))
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
		mods_arr = list(filter(bool, map(json_to_mod, mods)))
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
		SETTINGS = {
			"lang": args.get('language'),
			"use_cache": args.get('use_cache', True),
			"client": client_path,
			"mods": mods
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
