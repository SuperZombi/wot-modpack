import win32api
import os, sys
import xmltodict


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
	
	def delete_old_mods(self):
		pass