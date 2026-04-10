import os, sys
import shutil
import requests
import zipfile
import psutil
import json
from enum import Enum
from io import BytesIO
import xml.etree.ElementTree as ET
from functools import cached_property


class Version:
	def __init__(self, version:str):
		self.version_str = version
		self.version_arr = version.split('.')
		self.version_value = int("".join(self.version_arr))
	def __str__(self):return self.version_str
	def __repr__(self):return str(self)
	def __lt__(self, other): return self.version_value < other
	def __gt__(self, other): return self.version_value > other

class Logger:
	def __init__(self): self.logs = []
	def clear(self): self.logs.clear()
	def _log(self, level, message): self.logs.append({"level": level, "message": message})
	def log(self, message): self._log("info", message)
	def debug(self, message): self._log("debug", message)
	def warn(self, message): self._log("warn", message)
	def error(self, message): self._log("error", message)

class ModLogger:
	def __init__(self, logger, name):
		self.logger = logger
		self.name = name

	def __getattr__(self, attr):
		return lambda msg, *a, **k: getattr(self.logger, attr)(f"[{self.name}] {msg}", *a, **k)

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


class Launchers:
	def __init__(self):
		self.clients = []
		self.program_data = os.path.expandvars('%ProgramData%')
		
	def get_clients(self):
		for launcher in [
			('Wargaming.net','GameCenter'),
			('Wargaming.net','GameCenter for Steam')
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


class ClientBranch(Enum):
	RELEASE = "release"
	COMMON_TEST = "ct"
	SUPERTEST = "st"
	SANDBOX = "sb"
	CLOSED_TEST = "closed"

class ClientType(Enum):
	WG = "wg"
	STEAM = "steam"

class Client:
	def __init__(self, path, use_cache=True, logger=None):
		self.path = path
		self.use_cache = use_cache
		self.logger = logger
		self.exe = "WorldOfTanks.exe"
		appdata = os.path.join(os.getenv('APPDATA'), 'Wargaming.net', 'WorldOfTanks')
		self.appdata = appdata if os.path.exists(appdata) else None
		self.installed = []

	@property
	def is_running(self):
		for process in psutil.process_iter():
			if process and process.name() == self.exe:
				return self.path in process.cwd()
		return False

	@property
	def type(self):
		return ClientType.STEAM if "steam" in self.path.lower() else ClientType.WG

	@property
	def title(self):
		return f'WoT {self.realm.upper()} {self.version}{" (Steam)" if self.type == ClientType.STEAM else ""}'

	def __str__(self): return self.title
	def __repr__(self): return f"<{str(self)}>"

	def to_json(self):
		return {
			"path": self.path,
			"title": self.title,
			"type": self.type.value,
			"version": self.version,
			"lang": self.lang,
			"realm": self.realm,
			"branch": self.branch.value,
			"res_mods": self.res_mods,
			"mods_folder": self.mods_folder,
			"configs_path": self.configs_path,
		}

	@property
	def realm(self):
		return self._find_xml_text(self._version_xml, 'meta/realm').lower()

	@property
	def version(self):
		ver = self._find_xml_text(self._version_xml, 'version')
		if ver: return ver.replace('v.', '').strip().split()[0]

	@property
	def branch(self):
		ver = self._find_xml_text(self._version_xml, 'version')
		if ver:
			version = ver.lower()
			if 'common test' in version:
				return ClientBranch.COMMON_TEST
			if 'st' in version:
				return ClientBranch.SUPERTEST
			if 'sb' in version:
				return ClientBranch.SANDBOX
			if 'closed test' in version:
				return ClientBranch.CLOSED_TEST
			return ClientBranch.RELEASE

	@property
	def lang(self):
		return self._find_xml_text(self._game_info_xml, 'game/localization').lower()[:2]

	@property
	def mods_folder(self):
		return next(
			(os.path.join(self.path, folder) for folder in self._paths_xml if folder.startswith('mods')),
			None
		)

	@property
	def res_mods(self):
		return next(
			(os.path.join(self.path, folder) for folder in self._paths_xml if folder.startswith('res_mods')),
			None
		)

	@property
	def configs_path(self):
		return os.path.abspath(os.path.join(self.mods_folder, "..", "configs"))

	@cached_property
	def _version_xml(self): return self._parse_xml("version.xml")

	@cached_property
	def _game_info_xml(self): return self._parse_xml("game_info.xml")

	@cached_property
	def _paths_xml(self):
		root = self._parse_xml("paths.xml")
		elements = root.findall('Paths/Path')
		return list(map(lambda el: os.path.normpath(el.text.strip()), elements))

	def _parse_xml(self, path):
		return ET.parse(os.path.join(self.path, path)).getroot()

	def _find_xml_text(self, root, path):
		el = root.find(path)
		return el.text.strip() if el is not None else None

	def delete_mods(self, delete_configs=False, delete_logs=True):
		self.installed = []
		mods_f = os.path.join(self.path, "mods")
		res_mods = os.path.join(self.path, "res_mods")
		for path in [mods_f, res_mods]:
			if os.path.exists(path):
				for item in os.listdir(path):
					item_path = os.path.join(path, item)
					if (delete_configs==False) and os.path.isdir(item_path) and item == "configs": continue
					if os.path.isfile(item_path):
						self.logger.debug(f"Delete: {item_path}")
						os.remove(item_path)
					elif os.path.isdir(item_path):
						self.logger.debug(f"Delete: {item_path}")
						shutil.rmtree(item_path)
		self.logger.debug(f"Create: {self.res_mods}")
		os.makedirs(self.res_mods)
		self.logger.debug(f"Create: {self.mods_folder}")
		os.makedirs(self.mods_folder)

		if delete_configs and self.appdata:
			temp_configs = os.path.join(self.appdata, 'mods')
			if os.path.exists(temp_configs):
				self.logger.debug(f"Delete: {temp_configs}")
				shutil.rmtree(temp_configs)
		if delete_logs:
			logfile = os.path.join(self.path, "python.log")
			if os.path.exists(logfile):
				self.logger.debug(f"Delete: {logfile}")
				os.remove(logfile)

	def install_mod(self, mod, on_progress=None):
		if not mod.id in self.installed:
			result = mod.install(
				self,
				on_progress=on_progress,
				use_cache=self.use_cache,
				logger=self.logger
			)
			if result:
				self.installed.append(mod.id)
				self.logger.log(f"[{mod.id}] ✅ Done")
			else:
				self.logger.error(f"[{mod.id}] ⛔ Failed")
			return result
		self.logger.debug(f"[{mod.id}] Skipped (already installed)")
		return True


class Mod:
	def __init__(self, id, files, requires=None, version=None):
		self.id = id
		self.files = files
		self.requires = requires or []
		self.version = version
	def __str__(self): return f'<Mod "{self.id}">'
	def __repr__(self): return str(self)

	def install(self, client, on_progress=None, use_cache=True, logger=None):
		console = ModLogger(logger, self.id)
		console.log("Installing")
		if self.requires and len(self.requires) > 0:
			console.log(f"Requirements: [{', '.join(map(lambda x: x.id, self.requires))}]")
			for mod in self.requires:
				result = client.install_mod(mod)
				if not result: return False
			console.debug("Requirements installed")

		write_cache = True
		if use_cache:
			self.init_cache()
			have_cache = self.load_cache_files(log=console.debug)
			if have_cache:
				console.debug("In Cache")
				write_cache = False
			else:
				console.debug("Cache miss")
				self.delete_from_cache()

		cache_files = []

		for file in self.files:
			console.debug(f'File: {os.path.basename(file["url"])}')
			target_map = {
				"mods": os.path.join(client.mods_folder, file.get("folder", "")),
				"res_mods": os.path.join(client.res_mods, file.get("folder", "")),
				"configs": os.path.join(client.configs_path, file.get("folder", ""))
			}
			if file["dest"] == "configs" and file.get("folder") and file.get("delete_folder"):
				if os.path.exists(target_map[file["dest"]]):
					console.debug(f'Delete: {target_map[file["dest"]]}')
					shutil.rmtree(target_map[file["dest"]])
			os.makedirs(target_map[file["dest"]], exist_ok=True)

			if file["url"].startswith("http"):
				console.debug(f'Downloading: {file["url"]}')
				file_io = self.download(file["url"], on_progress=on_progress, logger=console)
				if not file_io: return False

				if file["url"].endswith(".zip"):
					target_dest = target_map[file["dest"]]
					console.debug(f"Unziping to: {target_dest}")
					with zipfile.ZipFile(file_io, 'r') as zip_ref:
						zip_ref.extractall(target_dest)
				else:
					target_file = os.path.join(target_map[file["dest"]], os.path.basename(file["url"]))
					console.debug(f'Moving to: {target_file}')
					with open(target_file, "wb") as f:
						f.write(file_io.read())

				if use_cache and write_cache:
					file_io.seek(0)
					os.makedirs(self.cache_folder, exist_ok=True)
					target_file = os.path.join(self.cache_folder, os.path.basename(file["url"]))
					with open(target_file, "wb") as f:
						f.write(file_io.read())
					console.debug(f"Saved to cache: {target_file}")
					cache_files.append({**file,
						"url": target_file
					})
			else:
				console.debug(f"Using cache: {file['url']}")
				if not os.path.exists(file["url"]):
					console.error(f"Local file not found: {file['url']}")
					return False
				if file["url"].endswith(".zip"):
					target_dest = target_map[file["dest"]]
					console.debug(f"Unziping to: {target_dest}")
					with zipfile.ZipFile(file["url"], 'r') as zip_ref:
						zip_ref.extractall(target_dest)
				else:
					target_file = os.path.join(target_map[file["dest"]], os.path.basename(file["url"]))
					console.debug(f'Moving to: {target_file}')
					shutil.copy(file["url"], target_map[file["dest"]])

		if use_cache and write_cache:
			self.update_cache_file(lambda data: data + [{
				"id": self.id,
				"ver": self.version,
				"files": cache_files
			}])
			console.debug(f"Cache updated")
		return True

	def download(self, url, on_progress=None, logger=None):
		try:
			r = requests.get(url, stream=True, timeout=10)
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
			logger.error(f"[{r.status_code}] Failed to download: {url}")
		except Exception as e:
			logger.error(f"⛔ Exception: {e}")

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

	def load_cache_files(self, log=None):
		cached_mod = next((d for d in self.cache if d["id"] == self.id), None)
		if cached_mod:
			cached_ver = cached_mod.get("ver", None)
			if self.version == cached_ver:
				cached_files = cached_mod.get("files", [])
				if all(os.path.exists(f["url"]) for f in cached_files):
					self.files = cached_files
					return True
			log(f"Need update: {cached_ver} ➜ {self.version}")

	def delete_from_cache(self):
		if os.path.exists(self.cache_folder):
			shutil.rmtree(self.cache_folder)
		self.update_cache_file(lambda data: list(filter(lambda x: x["id"] != self.id, data)))
