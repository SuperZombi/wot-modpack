import eel
import sys, os
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
	return clients

print(get_clients())


# MAIN
eel.init(resource_path("web"))
# browsers = ['chrome', 'edge', 'default']
browsers = ['default']
for browser in browsers:
	try:
		eel.start("index.html", mode=browser)
		break
	except: None
