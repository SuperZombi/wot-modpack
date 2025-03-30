import eel
import sys, os
import json
import re
import requests
from json_minify import json_minify
from utils import *


# Resources
def resource_path(relative_path=""):
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

def exe_path(relative_path=""):
	return os.path.join(os.getcwd(), relative_path)

settings_mods = [
	Mod("me.poliroid.modslistapi", [{
		"url": os.path.abspath(os.path.join("mods", "me.poliroid.modslistapi.wotmod")),
		"dest": "mods"
	}]),
	Mod("izeberg.modssettingsapi", [{
		"url": os.path.join("mods", "izeberg.modssettingsapi.wotmod"),
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
def load_mods_info():
	r = requests.get('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
	if r.ok:
		string = json_minify(r.content.decode()) # remove comments
		string = re.sub(r'''(?<=[}\]"']),(?!\s*[{["'])''', "", string, 0) # remove coma at the end
		return json.loads(string)


def download_progress(current, total):
	eel.installing_progress({"download_progress":round(current / total * 100)})

@eel.expose
def main_install(client_path, args, mods):
	# client = Client(client_path)
	client = Client("C:\\Games\\World_of_Tanks_CT")
	if args.get("delete_mods", False):
		client.delete_mods(args.get("delete_configs", False))
	if len(mods) > 0:
		for mod in settings_mods:
			client.install_mod(mod)

		mods_arr = list(map(lambda x: Mod(x.get('id'), x.get('files')), mods))
		total_mods = len(mods_arr)
		for index, mod in enumerate(mods_arr):
			eel.installing_progress({"current":index, "total":total_mods, "download_progress":0})
			client.install_mod(mod, on_progress=download_progress)


# MAIN
eel.init(resource_path("web"))
# browsers = ['chrome', 'edge', 'default']
browsers = ['default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser, size=(1000, 800))
		break
	except: None
