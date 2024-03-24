const Select=s=>document.querySelector(s);

window.onload=async _=>{
	
	initTabs(Select("#nav-tabs"), Select("#tab-content"))

	const main = Select("#main-container");

	let props = {
		summary: "Прицелы",
		data: [
			{title: "Прицел 1"},
			{title: "Прицел 2"},
			{title: "Прицел 3"}
		]
	}

	let radios = new radiosArea(props)
	main.appendChild(radios)

	await load_game_clients()

	initToolTips()
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
