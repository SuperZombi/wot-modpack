import eel
import sys, os
import win32api
import xmltodict


# Resources
def resource_path(relative_path=""):
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

def exe_path(relative_path=""):
	return os.path.join(os.getcwd(), relative_path)


###
def get_disks():
	return [drive for drive in win32api.GetLogicalDriveStrings()[0]]

def search_clients():
	templates = (
		('Games', 'World_of_Tanks_EU'),
		('Games', 'World_of_Tanks_NA'),
		('Games', 'World_of_Tanks_CT'),
		('Games', 'World_of_Tanks_SB'),
	)
	disks = get_disks()
	clients = []
	for _disk in disks:
		disk = f'{_disk}:'+os.sep
		for template in templates:
			path = os.path.join(disk, *template)
			if os.path.exists(path):
				clients.append(path)
	return clients

def get_clients_info(clients):
	all_clients = []
	for client in clients:
		client_info = {"path": client}

		with open(os.path.join(client, "version.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			meta = xpars.get('version.xml').get('meta')

			client_info["realm"] = meta.get('realm')
			client_info["version"] = meta.get('branch').strip('v')
			client_info["title"] = f"WoT {meta.get('realm')} {meta.get('branch').strip('v')}"

		with open(os.path.join(client, "game_info.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			data = xpars.get('protocol').get('game')

			client_info["lang"] = data.get('localization')

		with open(os.path.join(client, "paths.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			paths = xpars.get('root').get('Paths').get('Path')
			output = {}
			for path in paths:
				if isinstance(path, dict):
					path = os.path.normpath(path.get("#text"))
					arr = os.path.split(path)
					output[arr[-2]] = arr[-1]

			client_info["mods_folders"] = output

		all_clients.append(client_info)
	return all_clients


###
@eel.expose
def get_clients():
	clients = search_clients()
	return get_clients_info(clients)



# MAIN
eel.init(resource_path("web"))
# browsers = ['chrome', 'edge', 'default']
browsers = ['default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser)
		break
	except: None
