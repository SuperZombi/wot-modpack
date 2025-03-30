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


# MAIN
eel.init(resource_path("web"))
# browsers = ['chrome', 'edge', 'default']
browsers = ['default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser)
		break
	except: None
