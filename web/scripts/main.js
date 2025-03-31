var modsManager;
var modsData;

window.onload=async _=>{
	initLanguage()

	await load_game_clients()

	document.querySelector("#navigate_to_mods").onclick = async _=>{
		if (document.querySelector("#client_path").value){
			changeTab("mods")
			if (document.querySelector("#mods-area").getAttribute("loaded") == "false"){
				document.querySelector("#loader").classList.remove("hide")
				await load_mods_info()
				document.querySelector("#loader").classList.add("hide")
			}
		}
	}
	initSettings()
	changeTab("home")
	document.querySelector("#loader").classList.add("hide")

	document.querySelector("#main_button").onclick = _=>{
		changeTab("install")
		let selectedModsIds = modsManager.get()
		let selectedMods = modsData.mods.filter(mod => selectedModsIds.includes(mod.id))
		buildModsInstallList(selectedMods)
	}

	document.querySelector("#run_main_button").onclick = async _=>{
		changeTab("main_installer")
		let selectedModsIds = modsManager.get()
		let selectedMods = modsData.mods.filter(mod => selectedModsIds.includes(mod.id))
		let client = document.querySelector("#client_path").value
		let args = {
			"delete_mods": document.querySelector("#delete_all_mods").checked,
			"delete_configs": document.querySelector("#delete_mods_configs").checked
		}
		await eel.main_install(client, args, selectedMods)()
		changeTab("finish")
	}
}
function changeTab(tab_name){
	document.querySelectorAll("#tabs-area .tab.active").forEach(tab=>tab.classList.remove("active"))
	let target = document.querySelector(`#tabs-area .tab[name="${tab_name}"]`)
	if (target){
		target.classList.add("active")
	} else {
		console.error(`Tab "${tab_name}" is not definded!`)
	}
}

async function load_game_clients(){
	let parent = document.querySelector("#client_select")
	let clientsInfo = await eel.get_clients()()
	if (clientsInfo.length > 0){
		clientsInfo.forEach(client=>{
			let option = document.createElement("option")
			option.innerHTML = client.title
			option.title = client.path
			option.value = client.path
			parent.appendChild(option)
		})
	} else {
		let empt = document.createElement("option")
		empt.value = ""
		parent.appendChild(empt)
	}

	let opt = document.createElement("option")
	opt.value = "custom"
	opt.innerHTML = LANG("custom_game_folder")
	parent.appendChild(opt)
	
	parent.onchange = async _=>{
		if (parent.value == "custom"){
			let selected_client = await eel.request_custom_client()()
			if (!selected_client){
				parent.value = parent.firstChild.value
				alert(LANG("failed_get_client"))
			} else {
				let target = [...parent.querySelectorAll('option')].filter(opt=>opt.value==selected_client.path).shift()
				if (!target){
					target = document.createElement("option")
					target.title = selected_client.path
					target.value = selected_client.path
					target.innerHTML = selected_client.title
					parent.appendChild(target)
					parent.appendChild(parent.querySelector('option[value="custom"]'))
					let empty = parent.querySelector("option[value='']")
					empty ? empty.remove() : null
				}
				parent.value = target.value
				document.querySelector("#client_path").value = target.value
			}
		} else {
			document.querySelector("#client_path").value = parent.value
		}
	}
	parent.onchange()
}
async function load_mods_info(){
	modsData = await eel.load_mods_info()()
	if (modsData){
		modsManager = new ModsList(document.querySelector("#mods-list"), currentLang)

		modsData.categories.forEach(category=>{
			let avalible_mods = modsData.mods.filter(mod => mod.category == category.name)

			let category_element = modsManager.makeCategory(category.title, category.image)
			avalible_mods.forEach(mod=>{
				if (mod.group){
					let group = modsData.groups.find(x => x.id == mod.group)
					if (group){
						let group_element = category_element.getGroup(group.id)
						if (!group_element){
							group_element = modsManager.makeGroup(mod.group, group.title)
							category_element.add(group_element)
						}
						let mod_element = modsManager.makeRadio(mod, group.id)
						group_element.add(mod_element)
					}				
				} else {
					let mod_element = modsManager.makeCheckbox(mod)
					category_element.add(mod_element)
				}
			})
			modsManager.add(category_element)
		})
		document.querySelector("#mods-area").setAttribute("loaded", "true")
	} else {
		alert(LANG("mods_info_parse_fail"))
	}
}

function buildModsInstallList(mods){
	let parent = document.querySelector("#mods-install-list")
	if (mods.length > 0){
		parent.innerHTML = ""
		mods.forEach(mod=>{
			let el = document.createElement("li")
			el.innerHTML = mod.title[currentLang]
			parent.appendChild(el)
		})
	} else {
		parent.innerHTML = LANG("nothing_selected")
	}
}


eel.expose(installing_progress);
function installing_progress(message) {
	if (message.total){
		let e = document.querySelector("#progress-files")
		let bar = e.querySelector("progress")
		bar.value = message.current
		bar.max = message.total
		e.querySelector("span").innerHTML = `${message.current}/${message.total}`
	}
	else if (message.download_progress){
		let e = document.querySelector("#progress-download")
		e.querySelector("progress").value = message.download_progress
		e.querySelector("span").innerHTML = `${message.download_progress}%`
	}
}


function initSettings(){
	document.querySelector("#setting_button").onclick = _=>document.querySelector("#settings").classList.add("show")
	document.querySelector("#settings .close").onclick = _=>document.querySelector("#settings").classList.remove("show")
}
