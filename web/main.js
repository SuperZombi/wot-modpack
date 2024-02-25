window.onload=_=>{
	const main = document.querySelector("#main-container");
	// const root = ReactDOM.createRoot(main);
	// const e = React.createElement;

	let props = {
		summary: "Прицелы",
		data: [
			{title: "Прицел 1"},
			{title: "Прицел 2"},
			{title: "Прицел 3"}
		]
	}
	// root.render(e(RadiosArea, props));

	let radios = new radiosArea(props)
	main.appendChild(radios)
}


class radiosArea {
	constructor(props) {
		let wrapper = document.createElement('div')
		wrapper.innerHTML = `
			<fieldset style="outline: 1px solid; border-radius: 10px" class="p-2">
				<legend class="col-form-label p-1">
					<div class="form-check">
						<label>
							<input class="form-check-input" type="checkbox" collapse_controler/>
							<span>${props.summary}</span>
						</label>
					</div>
				</legend>
				<div class="collapse ps-1 pt-2">
					${props.data.map(option => {return`
						<div class="form-check mb-1">
							<label>
								<input class="form-check-input" type="radio" name=${props.summary} value=${option.title}/>
								<span>${option.title}</span>
							</label>
						</div>`
					}).join('')}
				</div>
			</fieldset>
		`
		this.element = wrapper.querySelector(":scope > *")
		this.initCollapse()
		return this.element
	}
	initCollapse(){
		this.controller = this.element.querySelector("[collapse_controler]")
		this.controller.onchange = _=>this.onChange()
		
		let collapse = this.element.querySelector(".collapse")
		this.bsCollapse = new bootstrap.Collapse(collapse, {toggle: false})
		collapse.addEventListener('hidden.bs.collapse', _=>this.enableInput())
		collapse.addEventListener('shown.bs.collapse', _=>this.enableInput())
	}
	onChange(){
		this.controller.disabled = true
		if (this.controller.checked){
			this.element.querySelector("input[type='radio']").checked = true
			this.bsCollapse.show()
		} else {
			this.bsCollapse.hide()
			this.resetAllRadios()
		}
	}
	resetAllRadios(){
		this.element.querySelectorAll("input[type='radio']").forEach(el=>{
			el.checked = false
		})
	}
	enableInput(){
		this.controller.disabled = false
	}
}

