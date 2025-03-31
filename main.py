import eel
import sys, os
import json
import re
import requests
from json_minify import json_minify
from tkinter import Tk
from tkinter.filedialog import askdirectory
from utils import *

__version__ = "0.0.1"

# Resources
def resource_path(relative_path=""):
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

@eel.expose
def app_version(): return __version__

settings_mods = [
	Mod("me.poliroid.modslistapi", [{
		"url": resource_path(os.path.join("mods", "me.poliroid.modslistapi.wotmod")),
		"dest": "mods"
	}]),
	Mod("izeberg.modssettingsapi", [{
		"url": resource_path(os.path.join("mods", "izeberg.modssettingsapi.wotmod")),
		"dest": "mods"
	}])
]

###
@eel.expose
def get_clients():
	clients = []
	for path in search_clients():
		clients.append(Client(path))
	return json.loads(json.dumps(clients, default=Client.to_json))

@eel.expose
def request_custom_client():
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	folder = askdirectory(parent=root)
	if folder:
		try:
			client = Client(os.path.normpath(folder))
			return client.to_json()
		except:
			return

@eel.expose
def load_mods_info():
	try:
		r = requests.get('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
		if r.ok:
			string = json_minify(r.content.decode()) # remove comments
			string = re.sub(r'''(?<=[}\]"']),(?!\s*[{["'])''', "", string, 0) # remove coma at the end
			return json.loads(string)
	except:
		return


def download_progress(current, total):
	eel.installing_progress({"download_progress":round(current / total * 100)})

@eel.expose
def main_install(client_path, args, mods):
	client = Client(client_path)
	if args.get("delete_mods", False):
		client.delete_mods(args.get("delete_configs", False))
	fails = []
	if len(mods) > 0:
		for mod in settings_mods:
			client.install_mod(mod)

		mods_arr = list(map(lambda x: Mod(x.get('id'), x.get('files')), mods))
		total_mods = len(mods_arr)
		for index, mod in enumerate(mods_arr):
			eel.installing_progress({"current":index, "total":total_mods, "download_progress":0})
			result = client.install_mod(mod, on_progress=download_progress)
			if not result: fails.append(mod.id)
	return fails


# MAIN
eel.init(resource_path("web"))
browsers = ['chrome', 'edge', 'default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser, size=(1000, 800), port=0)
		break
	except Exception: None
