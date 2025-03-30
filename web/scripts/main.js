var modsManager;

window.onload=async _=>{
	await load_game_clients()

	document.querySelector("#navigate_to_mods").onclick = async _=>{
		changeTab("mods")
		if (document.querySelector("#mods-area").getAttribute("loaded") == "false"){
			document.querySelector("#loader").classList.remove("hide")
			await load_mods_info()
			document.querySelector("#loader").classList.add("hide")
		}
	}
	changeTab("home")
	document.querySelector("#loader").classList.add("hide")


	document.querySelector("#main_button").onclick = _=>{
		console.log(modsManager.get())
		modsManager.changeLanguage("en")
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
	clientsInfo.forEach(client=>{
		let option = document.createElement("option")
		option.innerHTML = client.title
		option.title = client.path
		option.value = client.path
		parent.appendChild(option)
	})
	parent.appendChild(parent.querySelector("option[value='custom']"))
	parent.querySelector("option").selected = true
	
	parent.onchange = async _=>{
		if (parent.value == "custom"){
			console.log("Custom")
		}
	}
}
async function load_mods_info(){
	let data = await eel.load_mods_info()()
	if (data){
		modsManager = new ModsList(document.querySelector("#mods-list"), "uk")

		data.categories.forEach(category=>{
			let avalible_mods = data.mods.filter(mod => mod.category == category.name)

			let category_element = modsManager.makeCategory(category.title, category.image)
			avalible_mods.forEach(mod=>{
				if (mod.group){
					let group = data.groups.find(x => x.id == mod.group)
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
		alert("Failed to load mod info. Try again latter.")
	}
}



let LOCALES = {
	"author": {
		"en": "Author",
		"ru": "Автор",
		"uk": "Автор"
	}
}

// let categories = [
// 	{
// 		"name": "aim",
// 		"title": {
// 			"en": "Aim",
// 			"uk": "Приціл"
// 		},
// 		"image": "/images/aim.png"
// 	}
// ]
// let groups = [
// 	{
// 		"id": "custom_aim",
// 		"title": {
// 			"en": "Custom aim",
// 			"uk": "Кастомний приціл"
// 		}
// 	}
// ]
// let mods = [
// 	{
// 		"id": 1,
// 		"name": "reduce_aim",
// 		"title": {
// 			"en": "Reduce Aim by 25%",
// 			"uk": "Зменшити приціл на 25%"
// 		},
// 		"author": "P0LIR0ID",
// 		"category": "aim",
// 		"image": "https://wotsite.net/images/2016/5/6/4.jpg",
// 		"description": {
// 			"en": "Mod description",
// 			"uk": "Разработчики сделали круг сведения намного больше нежели круг реального разброса орудия"
// 		}
// 	},
// 	{
// 		"id": 2,
// 		"name": "aiming_time",
// 		"title": {
// 			"en": "Aiming time",
// 			"uk": "Час зведення прицілу"
// 		},
// 		"category": "aim",
// 		"image": "https://wotspeak.org/uploads/posts/2016-08/1471265165_2.jpg"
// 	},
// 	{
// 		"id": 4,
// 		"name": "custom_aim_1",
// 		"title": {
// 			"en": "Aim 1",
// 			"uk": "Приціл 1"
// 		},
// 		"group": "custom_aim",
// 		"category": "aim",
// 		"image": "",
// 		"description": {
// 			"uk": "Приціл 1"
// 		}
// 	},
// 	{
// 		"id": 5,
// 		"name": "custom_aim_2",
// 		"title": {
// 			"en": "Aim 2",
// 			"uk": "Приціл 2"
// 		},
// 		"group": "custom_aim",
// 		"category": "aim",
// 		"image": "",
// 		"description": ""
// 	},
// 	{
// 		"id": 6,
// 		"name": "custom_aim_3",
// 		"title": {
// 			"en": "Aim 3",
// 			"uk": "Приціл 3"
// 		},
// 		"group": "custom_aim",
// 		"category": "aim",
// 		"image": "",
// 		"description": ""
// 	}
// ]
