import win32api
import os, sys
import xmltodict
import shutil
import requests


class Version:
	def __init__(self, version:str):
		self.version_str = version
		self.version_arr = version.split('.')
		self.version_value = int("".join(self.version_arr))
	def __str__(self):return self.version_str
	def __repr__(self):return str(self)
	def __lt__(self, other): return self.version_value < other
	def __gt__(self, other): return self.version_value > other

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


def local():
	data_dir = os.path.join(os.getenv('APPDATA'), 'Web_Modpack')
	os.makedirs(data_dir, exist_ok=True)
	return data_dir


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

	def install_mod(self, mod, on_progress=None):
		return mod.install(self, on_progress=on_progress)


class Mod:
	def __init__(self, id, files):
		self.id = id
		self.files = files
	def __str__(self): return f'<Mod "{self.id}">'
	def __repr__(self): return str(self)

	def install(self, client, on_progress=None):
		for file in self.files:
			target_map = {
				"mods": client.mods_folder,
				"res_mods": client.res_mods,
				"configs": os.path.join(client.configs_path, file.get("folder", ""))
			}
			os.makedirs(target_map[file["dest"]], exist_ok=True)

			if file["url"].startswith("http"):
				success = self.download(file["url"], target_map[file["dest"]], on_progress=on_progress)
				if not success: return False
			else:
				shutil.copy(file["url"], target_map[file["dest"]])
		return True

	def download(self, url, target_folder, on_progress=None):
		filename = os.path.basename(url)
		try:
			r = requests.get(url, stream=True)
			if r.ok:
				total_size = int(r.headers.get("content-length", 0))
				downloaded = 0
				if on_progress: on_progress(downloaded, total_size)
				with open(os.path.join(target_folder, filename), "wb") as f:
					for data in r.iter_content(1024):
						downloaded+=len(data)
						if on_progress: on_progress(downloaded, total_size)
						f.write(data)
				return True
		except:
			None
