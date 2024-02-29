function initToolTips(){
	document.querySelectorAll('[title]').forEach(el=>new bootstrap.Tooltip(el))
}

class radiosArea {
	constructor(props) {
		let wrapper = document.createElement('div')
		wrapper.innerHTML = `
			<fieldset class="p-2">
				<legend class="col-form-label p-1">
					<div class="form-check">
						<label>
							<input class="form-check-input" type="checkbox" collapse_controler/>
							<span>${props.summary}</span>
						</label>
					</div>
				</legend>
				<div class="collapse ps-4 pt-2">
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

function initTabs(nav, content){
	let links = nav.querySelectorAll("a")
	let tabs = content.querySelectorAll("tab")
	links.forEach(link=>{
		link.onclick =_=>{
			let target = link.getAttribute("href")
			let target_tab = content.querySelector(`tab[name="${target}"]`)
			if (target_tab){
				resetActive()
				link.classList.add("active")
				target_tab.classList.add("active")
			}
		}
	})
	function resetActive(){
		links.forEach(l=>l.classList.remove("active"))
		tabs.forEach(t=>t.classList.remove("active"))
	}

	let onload_tab = window.location.hash
	if (onload_tab){
		let target_link = nav.querySelector(`a[href="${onload_tab}"]`)
		if (target_link){
			target_link.click()
		}
	} else{
		links[0].click()
	}
}
