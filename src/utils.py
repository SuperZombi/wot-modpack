import os, sys
import xmltodict
import shutil
import requests
import zipfile
import psutil
import json
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

def resource_path(relative_path=""):
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)
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

def get_folder_size(path):
	total_size = 0
	for dirpath, dirnames, filenames in os.walk(path):
		for f in filenames:
			fp = os.path.join(dirpath, f)
			if os.path.exists(fp): total_size += os.path.getsize(fp)
	return total_size

def load_locales():
	folder = os.path.join(resource_path("locales"))
	result = {}
	for locale in os.listdir(folder):
		file = os.path.join(folder, locale)
		with open(file, 'r', encoding='utf-8') as f:
			data = json.loads(f.read())
			result[os.path.splitext(locale)[0]] = data
	return result

def LangEngine(locales, lang):
	return lambda code: locales.get(lang).get(code) if code in locales.get(lang).keys() else locales.get('en').get(code)


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
					if client_path and not client_path in self.clients: self.clients.append(client_path)
		return self.clients

	def get_client_path(self, file):
		with open(file, 'r') as f:
			p = f.read().strip()
			exe = os.path.join(p, 'WorldOfTanks.exe')
			if os.path.exists(exe): return p


class Client:
	def __init__(self, path, use_cache=True):
		self.path = path
		self.parse_info()
		self.title = f"WoT {self.realm} {self.version}"
		self.exe = "WorldOfTanks.exe"
		self.installed = []
		self.use_cache = use_cache
		appdata = os.path.join(os.getenv('APPDATA'), 'Wargaming.net', 'WorldOfTanks')
		self.appdata = appdata if os.path.exists(appdata) else None

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
		mods_f = os.path.join(self.path, "mods")
		res_mods = os.path.join(self.path, "res_mods")
		for path in [mods_f, res_mods]:
			if os.path.exists(path):
				for item in os.listdir(path):
					item_path = os.path.join(path, item)
					if (delete_configs==False) and os.path.isdir(item_path) and item == "configs": continue
					if os.path.isfile(item_path): os.remove(item_path)
					elif os.path.isdir(item_path): shutil.rmtree(item_path)
		os.makedirs(self.res_mods)
		os.makedirs(self.mods_folder)

		if delete_configs and self.appdata:
			temp_configs = os.path.join(self.appdata, 'mods')
			if os.path.exists(temp_configs): shutil.rmtree(temp_configs)
		if delete_logs:
			logfile = os.path.join(self.path, "python.log")
			if os.path.exists(logfile): os.remove(logfile)

	def install_mod(self, mod, on_progress=None):
		if not mod.id in self.installed:
			result = mod.install(self, on_progress=on_progress, use_cache=self.use_cache)
			if result: self.installed.append(mod.id)
			return result
		return True


class Mod:
	def __init__(self, id, files, requires=None, version=None):
		self.id = id
		self.files = files
		self.requires = requires or []
		self.version = version
	def __str__(self): return f'<Mod "{self.id}">'
	def __repr__(self): return str(self)

	def install(self, client, on_progress=None, use_cache=True):
		if self.requires and len(self.requires) > 0:
			for mod in self.requires:
				client.install_mod(mod)

		write_cache = True
		if use_cache:
			self.init_cache()
			have_cache = self.load_cache_files()
			if have_cache:
				write_cache = False
			else:
				self.delete_from_cache()

		cache_files = []

		for file in self.files:
			target_map = {
				"mods": os.path.join(client.mods_folder, file.get("folder", "")),
				"res_mods": os.path.join(client.res_mods, file.get("folder", "")),
				"configs": os.path.join(client.configs_path, file.get("folder", ""))
			}
			if file["dest"] == "configs" and file.get("folder") and file.get("delete_folder"):
				if os.path.exists(target_map[file["dest"]]):
					shutil.rmtree(target_map[file["dest"]])
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

				if use_cache and write_cache:
					file_io.seek(0)
					os.makedirs(self.cache_folder, exist_ok=True)
					target_file = os.path.join(self.cache_folder, os.path.basename(file["url"]))
					with open(target_file, "wb") as f:
						f.write(file_io.read())
					cache_files.append({**file,
						"url": target_file
					})
			else:
				if not os.path.exists(file["url"]): return False
				if file["url"].endswith(".zip"):
					with zipfile.ZipFile(file["url"], 'r') as zip_ref:
						zip_ref.extractall(target_map[file["dest"]])
				else:
					shutil.copy(file["url"], target_map[file["dest"]])

		if use_cache and write_cache:
			self.update_cache_file(lambda data: data + [{
				"id": self.id,
				"ver": self.version,
				"files": cache_files
			}])

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
					if on_progress: on_progress(min(downloaded,total_size), total_size)
					file.write(data)
				file.seek(0)
				return file
			else:
				print(f"[{r.status_code}] Failed to download: {url}")
		except: None

	def init_cache(self):
		self.cache = []
		self.cache_file = os.path.join(local(), 'cache.json')
		self.cache_folder = os.path.join(local(), 'cache', self.id)
		if os.path.exists(self.cache_file):
			with open(self.cache_file, 'r', encoding='utf-8') as f:
				self.cache = json.load(f)

	def update_cache_file(self, callback):
		data = []
		if os.path.exists(self.cache_file):
			with open(self.cache_file, 'r', encoding='utf-8') as f:
				data = json.loads(f.read() or "[]")
		new_data = callback(data)
		with open(self.cache_file, 'w', encoding='utf-8') as f:
			f.write(json.dumps(new_data, indent=4, ensure_ascii=False))

	def load_cache_files(self):
		cached_mod = next((d for d in self.cache if d["id"] == self.id), None)
		if cached_mod:
			cached_ver = cached_mod.get("ver", None)
			if self.version == cached_ver:
				cached_files = cached_mod.get("files", [])
				if all(os.path.exists(f["url"]) for f in cached_files):
					self.files = cached_files
					return True

	def delete_from_cache(self):
		if os.path.exists(self.cache_folder):
			shutil.rmtree(self.cache_folder)
		self.update_cache_file(lambda data: list(filter(lambda x: x["id"] != self.id, data)))
