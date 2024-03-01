const Select=s=>document.querySelector(s);

window.onload=_=>{
	initToolTips()
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

	new simpleSelect(Select("#game-select"))
}
