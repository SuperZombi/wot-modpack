window.onload=_=>{
	const main = document.querySelector("#main-container");
	const root = ReactDOM.createRoot(main);
	const e = React.createElement;

	let props = {
		summary: "Прицелы",
		data: [
			{title: "Прицел 1"},
			{title: "Прицел 2"},
			{title: "Прицел 3"}
		]
	}
	root.render(e(RadiosArea, props));
}