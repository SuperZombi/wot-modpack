window.onload=async _=>{
	// await load_game_clients()

	let currentLang = "uk"
	let main_list = new ModsList(document.querySelector("#mods-list"))

	categories.forEach(category=>{
		let avalible_mods = mods.filter(mod => mod.category == category.name)

		let category_element = makeCategory(category.text[currentLang], category.image)
		avalible_mods.forEach(mod=>{
			if (mod.group){
				let group = groups.find(x => x.id == mod.group)
				if (group){
					let group_element = category_element.getGroup(group.id)
					if (!group_element){
						group_element = new Group(mod.group, group.text[currentLang])
						category_element.add(group_element)
					}
					let mod_element = new Checkbox(mod.id, mod.text[currentLang], "radio", group.id)
					group_element.add(mod_element)
				}
				
				
			} else {
				let mod_element = new Checkbox(mod.id, mod.text[currentLang])
				category_element.add(mod_element)
			}
		})
		main_list.add(category_element)
	})

	document.querySelector("#main_button").onclick = _=>{
		console.log(main_list.get())
	}

}

async function load_game_clients(){
	let clientsInfo = await eel.get_clients()()
	let parent = document.querySelector("#game-select .select-data")
	clientsInfo.forEach(client=>{
		let option = document.createElement("option")
		option.innerHTML = client.title
		option.title = client.path
		option.value = client.path
		option.setAttribute("data-bs-placement", "right")
		parent.appendChild(option)
	})
	new simpleSelect(Select("#game-select"))
}



let categories = [
	{
		"name": "aim",
		"text": {
			"uk": "Приціл"
		},
		"image": "/images/aim.png"
	}
]
let groups = [
	{
		"id": "custom_aim",
		"text": {
			"uk": "Кастомний приціл"
		}
	}
]
let mods = [
	{
		"id": 1,
		"name": "reduce_aim",
		"text": {
			"uk": "Зменшити приціл на 25%"
		},
		"category": "aim"
	},
	{
		"id": 2,
		"name": "aiming_time",
		"text": {
			"uk": "Час зведення прицілу"
		},
		"category": "aim"
	},
	{
		"id": 3,
		"name": "aiming",
		"text": {
			"uk": "Час зведення 2"
		},
		"category": "aim2"
	},
	{
		"id": 4,
		"name": "custom_aim_1",
		"text": {
			"uk": "Приціл 1"
		},
		"group": "custom_aim",
		"category": "aim"
	},
	{
		"id": 5,
		"name": "custom_aim_2",
		"text": {
			"uk": "Приціл 2"
		},
		"group": "custom_aim",
		"category": "aim"
	},
	{
		"id": 6,
		"name": "custom_aim_3",
		"text": {
			"uk": "Приціл 3"
		},
		"group": "custom_aim",
		"category": "aim"
	}
]
