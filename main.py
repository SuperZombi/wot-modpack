import eel
import sys, os
import win32api
import xmltodict
import json


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
		('Games', 'World_of_Tanks_CT')
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

def get_cliens_info(cliens):
	for client in cliens:

		with open(os.path.join(client, "version.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			data = xpars.get('version.xml')
			meta = data.get('meta')

			output = {
				"version": data.get('version'),
				"localization": meta.get('localization'),
				"realm": meta.get('realm'),
				"branch": meta.get('branch')
			}
			print("version.xml")
			print(json.dumps(output, indent=4))


		with open(os.path.join(client, "game_info.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			data = xpars.get('protocol').get('game')

			output = {
				"localization": data.get('localization'),
				"version_name": data.get('version_name'),
			}
			print("game_info.xml")
			print(json.dumps(output, indent=4))

		with open(os.path.join(client, "game_metadata", "metadata.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			data = xpars.get('protocol')
			meta = data.get('predefined_section')

			output = {
				"fs_name": meta.get('fs_name'),
				"shortcut_name": meta.get('shortcut_name'),
				"environment_name": meta.get('environment_name'),

				"name": meta.get('name'),  # dont use
				"default_language": meta.get('default_language') # dont use
			}
			print("metadata.xml")
			print(json.dumps(output, indent=4))

		with open(os.path.join(client, "paths.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			paths = xpars.get('root').get('Paths').get('Path')
			output = {}
			for path in paths:
				if isinstance(path, dict):
					path = os.path.normpath(path.get("#text"))
					arr = os.path.split(path)
					output[arr[-2]] = arr[-1]
			print("paths.xml")
			print(json.dumps(output, indent=4))
			
		print()


# print(get_cliens_info(search_clients()))
# import sys
# sys.exit(0)

# MAIN
eel.init(resource_path("web"))
# browsers = ['chrome', 'edge', 'default']
browsers = ['default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser)
		break
	except: None
