import os, sys
import xmltodict
import shutil
import requests
import zipfile
import psutil
from io import BytesIO


class Version:
	def __init__(self, version:str):
		self.version_str = version
		self.version_arr = version.split('.')
		self.version_value = int("".join(self.version_arr))
	def __str__(self):return self.version_str
	def __repr__(self):return str(self)
	def __lt__(self, other): return self.version_value < other
	def __gt__(self, other): return self.version_value > other

def local():
	data_dir = os.path.join(os.getenv('APPDATA'), 'Web_Modpack')
	os.makedirs(data_dir, exist_ok=True)
	return data_dir

def get_all_files(folder):
	files = []
	for dirpath, _, filenames in os.walk(folder):
		for filename in filenames:
			files.append(os.path.join(dirpath, filename))
	return files


class Launchers:
	def __init__(self):
		self.clients = []
		self.program_data = os.path.expandvars('%ProgramData%')
		
	def get_clients(self):
		for launcher in [
			('Wargaming.net','GameCenter')
		]:
			path = os.path.join(self.program_data, *launcher)
			if os.path.exists(path):
				apps = os.path.join(path, "apps")
				files = get_all_files(apps)
				for file in files:
					client_path = self.get_client_path(file)
					if not client_path in self.clients: self.clients.append(client_path)
		return self.clients

	def get_client_path(self, file):
		with open(file, 'r') as f:
			p = f.read().strip()
			exe = os.path.join(p, 'WorldOfTanks.exe')
			if os.path.exists(exe): return p


class Client:
	def __init__(self, path):
		self.path = path
		self.parse_info()
		self.title = f"WoT {self.realm} {self.version}"
		self.exe = "WorldOfTanks.exe"
		self.installed = []

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
	@property
	def is_running(self):
		for process in psutil.process_iter():
			if process and process.name() == self.exe:
				return self.path in process.cwd()
		return False

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
	
	def delete_mods(self, delete_configs=False, delete_logs=True):
		self.installed = []
		arr = [self.mods_folder, self.res_mods]
		if delete_configs: arr.append(self.configs_path)
		for path in arr:
			if os.path.exists(path):
				shutil.rmtree(path)
				os.makedirs(path)
		if delete_logs:
			logfile = os.path.join(self.path, "python.log")
			if os.path.exists(logfile): os.remove(logfile)

	def install_mod(self, mod, on_progress=None):
		if not mod.id in self.installed:
			result = mod.install(self, on_progress=on_progress)
			if result: self.installed.append(mod.id)
			return result
		return True


class Mod:
	def __init__(self, id, files, requires=None):
		self.id = id
		self.files = files
		self.requires = requires or []
	def __str__(self): return f'<Mod "{self.id}">'
	def __repr__(self): return str(self)

	def install(self, client, on_progress=None):
		if self.requires and len(self.requires) > 0:
			for mod in self.requires:
				client.install_mod(mod)

		for file in self.files:
			target_map = {
				"mods": client.mods_folder,
				"res_mods": client.res_mods,
				"configs": os.path.join(client.configs_path, file.get("folder", ""))
			}
			os.makedirs(target_map[file["dest"]], exist_ok=True)

			if file["url"].startswith("http"):
				file_io = self.download(file["url"], on_progress=on_progress)
				if not file_io: return False

				if file["url"].endswith(".zip"):
					with zipfile.ZipFile(file_io, 'r') as zip_ref:
						zip_ref.extractall(target_map[file["dest"]])
				else:
					target_file = os.path.join(target_map[file["dest"]], os.path.basename(file["url"]))
					with open(target_file, "wb") as f:
						f.write(file_io.read())
			else:
				if file["url"].endswith(".zip"):
					with zipfile.ZipFile(file["url"], 'r') as zip_ref:
						zip_ref.extractall(target_map[file["dest"]])
				else:
					shutil.copy(file["url"], target_map[file["dest"]])
		return True

	def download(self, url, on_progress=None):
		try:
			r = requests.get(url, stream=True)
			if r.ok:
				total_size = int(r.headers.get("content-length", 0))
				downloaded = 0
				if on_progress: on_progress(downloaded, total_size)
				file = BytesIO()
				for data in r.iter_content(1024):
					downloaded+=len(data)
					if on_progress: on_progress(downloaded, total_size)
					file.write(data)
				file.seek(0)
				return file
			else:
				print(f"[{r.status_code}] Failed to download: {url}")
		except: None
