class ModsList{
	constructor(parent, language){
		this.root = parent
		this.childs = []
		this.language = language
	}
	add(element){
		this.childs.push(element)
		this.root.appendChild(element.root)
	}
	get(){
		return this.childs.map(child=>child.get()).flat(Infinity)
	}
	find(id){
		for (let item of this.childs) {
			let el = item.find(id)
			if (el){ return el }
		}
	}
	change(id, value){
		let el = this.find(id)
		if (el){ el.set(value) }
	}
	search(text){
		this.childs.map(child=>child.search(text))
	}
	unsetSearch(){
		this.root.querySelectorAll('.hide').forEach(el=>{
			el.classList.remove("hide")
		})
		this.childs.map(child=>child.collapse())
	}
	resetAll(){
		this.root.querySelectorAll('label[id]').forEach(el=>{
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
	changeLanguage(new_language){
		this.language = new_language
		this.childs.map(child=>child.changeLanguage(new_language))
	}
	makeCategory(text_data, image=null){
		let x = new Details()
		x.root.classList.add("category")
		if (image){
			let img = document.createElement("img")
			img.src = image
			x.summary.appendChild(img)
		}
		let header = document.createElement("span")
		x.summary.appendChild(header)
		x.onLangChange = new_lang=>{
			header.innerHTML = text_data[new_lang]
		}
		x.onLangChange(this.language)
		return x
	}
	makeCheckbox(mod_info){
		return new Checkbox(mod_info, this.language)
	}
	makeRadio(mod_info, group_id=null){
		return new Checkbox(mod_info, this.language, group_id)
	}
	makeGroup(id, text){
		return new Group(id, text, this.language)
	}
}

class Details{
	constructor() {
		this.childs = []
		this.root = document.createElement('div')
		this.root.className = "details"
		this.summary = document.createElement('label')
		this.summary.className = "summary hover"
		this.open = document.createElement('input')
		this.open.type = "checkbox"
		this.summary_head = document.createElement("span")
		let collapse = document.createElement("div")
		collapse.className = "collapse"
		let wrapper = document.createElement("div")
		wrapper.className = "wrapper"
		this.content = document.createElement("div")
		this.content.className = "content"

		wrapper.appendChild(this.content)
		collapse.appendChild(wrapper)
		this.summary.appendChild(this.open)
		this.root.appendChild(this.summary)
		this.root.appendChild(collapse)

		this.onLangChange = _=>{}
	}
	find(id){
		for (let item of this.childs) {
			let el = item.find(id)
			if (el){ return el }
		}
	}
	add(element){
		this.childs.push(element)
		this.content.appendChild(element.root)
	}
	getGroup(id){
		return this.childs.find(el=>el.id == id)
	}
	search(text){
		let founded = false
		this.childs.forEach(child=>{
			if (child.search(text)){
				founded = true
			}
		})
		this.root.classList.toggle("hide", !founded)
		founded ? this.open.checked = true : null
		return founded
	}
	collapse(){
		this.open.checked = false
	}
	get(){
		return this.childs.map(child=>child.get()).filter(Boolean)
	}
	changeLanguage(new_language){
		this.childs.map(child=>child.changeLanguage(new_language))
		this.onLangChange(new_language)
	}
}

class Checkbox{
	constructor(mod_info, language="en", group_id=null){
		this.id = mod_info.id
		this.language = language
		this.root = document.createElement("label")
		this.root.className = "mod hover"
		this.root.setAttribute("id", this.id)
		this.input = document.createElement("input")
		this.input.className = "hover"
		this.input.type = group_id ? "radio" : "checkbox"
		if (group_id){
			this.input.name = group_id
		}
		this.title_data = mod_info.title
		this.description_data = mod_info.description
		this.image = mod_info.image || ""
		this.title = document.createElement("span")
		this.title.innerHTML = Text(this.title_data[this.language])
		this.description = this.description_data ? (this.description_data[this.language] ? this.description_data[this.language] : "") : ""
		this.author = mod_info.author || ""
		this.root.appendChild(this.input)
		this.root.appendChild(this.title)
		this.hovered = false
		this.audio = null
		if (mod_info.cached_ver){
			if (mod_info.ver !== mod_info.cached_ver){
				let badge = document.createElement("span")
				badge.className = "new-badge"
				badge.style.cursor = "help"
				badge.title = LANG("mod_updated")
				badge.setAttribute("lang_title", "mod_updated")
				this.root.appendChild(badge)
			}
		}

		this.root.addEventListener("mouseover", _=>{
			if (!this.hovered){
				this.hovered = true
				document.querySelector("#mod-image").src = this.image
				document.querySelector("#mod-title").innerHTML = Text(this.title_data[this.language])
				document.querySelector("#mod-description").innerHTML = this.description
				if (this.author){
					document.querySelector("#mod-author").innerHTML = `
						<span>${LANG('author')}</span>
						<span>${this.author}</span>
					`
				} else {
					document.querySelector("#mod-author").innerHTML = ""
				}
				if (mod_info.audio){
					this.audio = new Audio(mod_info.audio);
					this.audio.play();
				}
				document.querySelector("#mod-preview").classList.add("show")
			}
		})
		this.root.addEventListener("mouseleave", _=>{
			if (this.audio){
				this.audio.pause();
			}
			document.querySelector("#mod-preview").classList.remove("show")
			setTimeout(_=>{
				if (!document.querySelector("#mod-preview").classList.contains("show")){
					document.querySelector("#mod-image").src = ""
					document.querySelector("#mod-title").innerHTML = ""
					document.querySelector("#mod-description").innerHTML = ""
					document.querySelector("#mod-author").innerHTML = ""
				}
			}, 250)
			this.hovered = false
		})
	}
	get(){
		if (this.input.checked){
			return this.id
		}
	}
	search(text){
		let lowerText = text.toLowerCase();
		let check = (value) =>
			typeof value === 'string' && value.toLowerCase().includes(lowerText);
		if (
			check(this.id) ||
			check(this.author) ||
			Object.values(this.title_data || {}).some(check) ||
			Object.values(this.description_data || {}).some(check)
		) {
			this.root.classList.remove("hide")
			return true
		} else {
			this.root.classList.add("hide")
			return false
		}
	}
	set(value){
		this.input.checked = value
		if (this.input.type == "radio"){
			let parent_group = this.root.closest(".group")
			let group_checkbox = parent_group.querySelector(".summary input[type=checkbox]")
			group_checkbox.checked = value
		}
	}
	find(id){
		return this.id == id ? this : null
	}
	changeLanguage(new_language){
		this.language = new_language
		this.title.innerHTML = Text(this.title_data[new_language])
		this.description = this.description_data ? (this.description_data[this.language] ? this.description_data[this.language] : "") : ""
	}
}

class Group{
	constructor(id, text_data, language="en"){
		this.id = id
		this.details = new Details()
		this.text_data = text_data
		this.details.root.classList.add("group")
		this.name = document.createElement("span")
		this.name.innerHTML = this.text_data[language]
		this.details.summary.appendChild(this.name)
		this.root = this.details.root
		this.content = this.details.content
	}
	add(element){
		this.details.add(element)
	}
	find(id){
		return this.details.find(id);
	}
	search(text){
		return this.details.search(text)
	}
	get(){
		if (this.details.open.checked){
			let checked_child = this.details.childs.find(child=>child.input.checked)
			if (checked_child){
				return checked_child.id
			}
		}
	}
	changeLanguage(new_language){
		this.name.innerHTML = this.text_data[new_language]
		this.details.childs.map(child=>child.changeLanguage(new_language))
	}
}
function Text(text){ return replaceFlags(text) }
function replaceFlags(text) {
	return text.replace(/:flag_([a-z]{2}):/gi, (_, code) => {
		return `<span class="fi fi-${code}"></span>`;
	})
}
