var modsManager;
var modsData;

window.onload=async _=>{
	await initSettings()
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
			"delete_configs": document.querySelector("#delete_mods_configs").checked,
			"language": document.querySelector('.setting_element[name="language"]').value
		}
		let fails = await eel.main_install(client, args, selectedMods)()
		let result_area = document.querySelector("#install_results")
		if (fails.length > 0){
			result_area.innerHTML = `<h3>${LANG("failed_to_install")}:</h3>`
			let list = document.createElement("ul")
			list.className = "mods-install-list"
			fails.forEach(fail=>{
				let li = document.createElement("li")
				li.innerHTML = fail
				list.appendChild(li)
			})
			result_area.appendChild(list)
		} else {
			result_area.innerHTML = `<h3>${LANG("installed_success")}</h3>`
		}
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
	function createOption(value, text){
		let e = document.createElement("option")
		e.value = value
		e.title = value
		e.innerHTML = text
		return e
	}

	let parent = document.querySelector("#client_select")
	let clientsInfo = await eel.get_clients()()
	if (clientsInfo.length > 0){
		clientsInfo.forEach(client=>{
			parent.appendChild(createOption(client.path, client.title))
		})
	} else {
		parent.appendChild(createOption("", ""))
	}
	parent.appendChild(createOption("custom", LANG("custom_game_folder")))

	let settings = await eel.load_settings()()
	if (settings){
		if (settings.client){
			let client_info = await eel.get_client_info_by_path(settings.client)()
			let target = [...parent.querySelectorAll('option')].filter(opt=>opt.value==client_info.path).shift()
			if (target){
				parent.value = client_info.path
			} else {
				target = createOption(client_info.path, client_info.title)
				parent.appendChild(target)
				parent.appendChild(parent.querySelector('option[value="custom"]'))
				parent.value = target.value
				let empty = parent.querySelector("option[value='']")
				empty ? empty.remove() : null
			}
		}
	}
	
	parent.onchange = async _=>{
		if (parent.value == "custom"){
			let selected_client = await eel.request_custom_client()()
			if (!selected_client){
				parent.value = parent.firstChild.value
				alert(LANG("failed_get_client"))
			} else {
				let target = [...parent.querySelectorAll('option')].filter(opt=>opt.value==selected_client.path).shift()
				if (!target){
					target = createOption(selected_client.path, selected_client.title)
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
		let settings = await eel.load_settings()()
		if (settings){
			if (settings.mods){
				settings.mods.forEach(mod_id=>{
					let el = modsManager.root.querySelector(`label[id="${mod_id}"]`)
					if (el){
						let input = el.querySelector("input")
						if (input.type == "checkbox"){
							input.checked = true
						}
						else if (input.type == "radio"){
							input.checked = true
							let parent_group = el.closest(".group")
							let group_checkbox = parent_group.querySelector(".summary input[type=checkbox]")
							group_checkbox.checked = true
						}
					}
				})
			}
		}
		document.querySelector("#mods-area").setAttribute("loaded", "true")
	} else {
		alert(LANG("mods_info_parse_fail"))
	}
}

function resetSelectedMods(){
	if (confirm(LANG("reset_confirm"))){
		modsManager.root.querySelectorAll('label[id]').forEach(el=>{
			let input = el.querySelector("input")
			if (input.type == "checkbox"){
				input.checked = false
			}
			else if (input.type == "radio"){
				input.checked = false
				let parent_group = el.closest(".group")
				let group_checkbox = parent_group.querySelector(".summary input[type=checkbox]")
				group_checkbox.checked = false
			}
		})
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


async function initSettings(){
	document.querySelectorAll(".popup").forEach(popup=>{
		let x = popup.querySelector(".close")
		if (x){
			x.onclick = _=>popup.classList.remove("show")
		}
	})
	document.querySelector("#setting_button").onclick = _=>document.querySelector("#settings").classList.add("show")
	document.querySelector("#app-version").innerHTML = await eel.app_version()()
	let update_available = await eel.check_updates()()
	if (update_available){
		document.querySelector("#update_popup").classList.add("show")
	}
	let settings = await eel.load_settings()()
	if (settings){
		if (settings.lang){
			currentLang = settings.lang
		}
	}
}
