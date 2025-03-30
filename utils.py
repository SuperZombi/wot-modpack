import win32api
import os, sys
import xmltodict
import shutil


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



class Client:
	def __init__(self, path):
		self.path = path
		self.parse_info()
		self.title = f"WoT {self.realm} {self.version}"

	def __str__(self): return self.title
	def __repr__(self): return f"<{str(self)}>"
	def to_json(self):
		return {
			"path": self.path,
			"title": self.title,
			"realm": self.realm,
			"version": self.version,
			"lang": self.lang,
			"res_mods": self.res_mods,
			"mods_folder": self.mods_folder,
			"configs_path": self.configs_path,
		}

	def parse_info(self):
		with open(os.path.join(self.path, "version.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			meta = xpars.get('version.xml').get('meta')

			self.realm = meta.get('realm')
			self.version = meta.get('branch').strip('v')

		with open(os.path.join(self.path, "game_info.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			data = xpars.get('protocol').get('game')

			self.lang = data.get('localization')

		with open(os.path.join(self.path, "paths.xml"), 'r', encoding="utf-8") as f:
			xpars = xmltodict.parse(f.read())
			paths = xpars.get('root').get('Paths').get('Path')
			for folder in paths:
				if isinstance(folder, dict):
					folder = os.path.normpath(folder.get("#text"))
					path = os.path.join(self.path, folder)
					if 'res_mods' in folder:
						self.res_mods = path
					elif 'mods' in folder:
						self.mods_folder = path
						self.configs_path = os.path.abspath(os.path.join(self.mods_folder, "..", "configs"))
	
	def delete_mods(self, delete_configs=False):
		arr = [self.mods_folder, self.res_mods]
		if delete_configs: arr.append(self.configs_path)
		for path in arr:
			if os.path.exists(path):
				shutil.rmtree(path)
				os.makedirs(path)

	def install_mod(self, mod):
		mod.install(self.mods_folder)



class Mod:
	def __init__(self, id, path):
		self.id = id
		self.path = path
	def install(self, target_dir):
		shutil.copy(self.path, target_dir)



# mods_list = Mod("me.poliroid.modslistapi", resource_path(os.path.join("mods", "me.poliroid.modslistapi.wotmod")))
# settings_api = Mod("izeberg.modssettingsapi", resource_path(os.path.join("mods", "izeberg.modssettingsapi.wotmod")))


# client = Client("C:\\Games\\World_of_Tanks_CT")
# client.install_mod(mods_list)
# client.install_mod(settings_api)
