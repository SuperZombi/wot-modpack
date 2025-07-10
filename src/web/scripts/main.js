var modsManager;
var modsData;

window.onload=async _=>{
	await initSettings()
	await initLanguage()
	await load_game_clients()
	Gallery(document.querySelector("#gallery"))
	initSearch()

	async function load_mods_list(){
		if (document.querySelector("#client_path").value){
			if (document.querySelector("#mods-area").getAttribute("loaded") == "false"){
				document.querySelector("#retry_button").classList.add("hide")
				document.querySelector("#loader").classList.remove("hide")
				await load_mods_info()
				document.querySelector("#loader").classList.add("hide")
			}
		}
	}

	[
		document.querySelector("#navigate_to_mods_list"),
		document.querySelector("#back_to_mods_list")
	].forEach(button=>{
		button.onclick = _=>{
			changeTab("mods")
			load_mods_list()
		}
	})
	document.querySelector("#retry_button").onclick = _=>{load_mods_list()}
	changeTab("home")
	document.querySelector("#loader").classList.add("hide")

	document.querySelector("#main_button").onclick = async _=>{
		changeTab("install")
		if (modsData){
			let selectedModsIds = modsManager.get()
			let selectedMods = modsData.mods.filter(mod => selectedModsIds.includes(mod.id))
			let cached = await eel.get_cache_info()()
			buildModsInstallList(selectedMods, cached)
		} else{
			buildModsInstallList([], [])
		}
	}
	document.querySelector("#delete_mods").onclick = async _=>{
		changeTab("install")
		buildModsInstallList([], [])
	}

	document.querySelector("#run_main_button").onclick = async _=>{
		changeTab("main_installer")
		Gallery(document.querySelector("#gallery_install"))
		let selectedMods = [...document.querySelectorAll("#mods-install-list .mod-item")].map(item=>{
			return item.getAttribute("mod_id")
		})
		let client = document.querySelector("#client_path").value
		let args = {
			"delete_mods": document.querySelector("#delete_all_mods").checked,
			"delete_configs": document.querySelector("#delete_mods_configs").checked,
			"save_selected_mods": document.querySelector("#save_selected_mods").checked,
			"language": document.querySelector('.setting_element[name="language"]').value,
			"use_cache": document.querySelector('.setting_element[name="use_cache"]').checked
		}
		let fails = await eel.main_install(client, args, selectedMods)()
		let result_area = document.querySelector("#install_results")
		if (fails.length > 0){
			document.querySelector("#refs").classList.remove("show")
			document.querySelector("#report_bug").style.display = "block"
			result_area.innerHTML = `<h3>${LANG("failed_to_install")}:</h3>`
			if (fails.length == 1 && fails[0] instanceof Object){
				result_area.innerHTML = `
					<h3 style="color:red;line-height:30px;">${fails[0]['error']}</h3>
				`
			} else {
				let list = document.createElement("ul")
				list.className = "mods-install-list"
				list.style.paddingLeft = "30px"
				list.style.marginLeft = "-30px"
				fails.forEach(fail=>{
					let li = document.createElement("li")
					li.innerHTML = fail
					list.appendChild(li)
				})
				result_area.appendChild(list)
			}
		} else {
			result_area.innerHTML = `<h3>${LANG("installed_success")}</h3>`
			document.querySelector("#refs").classList.add("show")
			document.querySelector("#report_bug").style.display = "none"
		}
		await update_cache_size()
		changeTab("finish")
		Gallery(document.querySelector("#gallery_finish"))
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
			if (client_info){
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
	let cached = await eel.get_cache_info()()
	if (modsData){
		document.querySelector("#retry_button").classList.add("hide")
		document.querySelector("#mods-list-area").classList.remove("hide")
		modsManager = new ModsList(document.querySelector("#mods-list"), currentLang)

		modsData.categories.forEach(category=>{
			let avalible_mods = modsData.mods.filter(mod => mod.category == category.name)

			let category_element = modsManager.makeCategory(category.title, category.image)
			avalible_mods.forEach(mod=>{
				mod.cached_ver = (cached.find(el=>el.id==mod.id)||{}).ver || null;
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
					modsManager.change(mod_id, true)
				})
			}
		}
		document.querySelector("#mods-area").setAttribute("loaded", "true")
	} else {
		alert(LANG("mods_info_parse_fail"))
		document.querySelector("#retry_button").classList.remove("hide")
	}
}

function resetSelectedMods(){
	if (confirm(LANG("reset_confirm"))){
		modsManager.resetAll()
	}
}

function buildModsInstallList(mods, cached){
	let parent = document.querySelector("#mods-install-list")
	let cur_mods_leght = mods.length
	if (cur_mods_leght > 0){
		parent.innerHTML = ""
		mods.forEach(mod=>{
			let el = document.createElement("div")
			el.className = "mod-item"
			el.setAttribute("mod_id", mod.id)
			let icon = document.createElement("img")
			let cached_ver = (cached.find(el=>el.id==mod.id)||{}).ver || null;
			if (cached_ver && cached_ver === mod.ver){
				icon.src = "images/check.svg"
				icon.title = LANG("mod_in_cache")
				icon.setAttribute("lang_title", "mod_in_cache")
			} else {
				icon.src = "images/down-arrow.svg"
				icon.title = LANG("mod_will_be_downloaded")
				icon.setAttribute("lang_title", "mod_will_be_downloaded")
				el.style.order = -1
			}
			let title = document.createElement("span")
			title.innerHTML = Text(mod.title[currentLang])
			el.appendChild(icon)
			el.appendChild(title)

			let remove_mod = document.createElement("img")
			remove_mod.src = "images/close.svg"
			remove_mod.className = "remove hover"
			remove_mod.title = LANG("remove")
			remove_mod.setAttribute("lang_title", "remove")
			remove_mod.onclick = _=>{
				modsManager.change(mod.id, false)
				el.remove()
				cur_mods_leght -= 1
				if (cur_mods_leght == 0){
					parent.innerHTML = LANG("mods_will_be_deleted")
				}
			}

			el.appendChild(remove_mod)
			parent.appendChild(el)
		})
	} else {
		parent.innerHTML = LANG("mods_will_be_deleted")
	}
}


eel.expose(installing_progress);
function installing_progress(message) {
	if (message.id){
		document.querySelector("#current_mod_id").innerHTML = message.id
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

function initSearch(){
	let input = document.querySelector("#search-area input")
	input.addEventListener("input", debounce(_=>{
		let value = input.value.trim()
		if (value != ""){
			if (modsData){
				modsManager.search(value)
			}
		} else {
			modsManager.unsetSearch()
		}
	}, 500))
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
		if (settings.use_cache != null){
			document.querySelector('.setting_element[name="use_cache"]').checked = settings.use_cache
		}
	}
	update_cache_size()
}
function debounce(func, delay) {
	let timer;
	return function(...args) {
		clearTimeout(timer)
		timer = setTimeout(() => func.apply(this, args), delay)
	}
}
function bytesToMb(bytes) {
	return Math.round(bytes / (1024 * 1024));
}
async function clear_cache(){
	await eel.delete_cache()()
	await update_cache_size()
}
async function update_cache_size(){
	let cache = await eel.get_cache_size()()
	document.querySelector("#cache_size").innerHTML = `${bytesToMb(cache)}`
}
