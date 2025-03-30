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
	add(element){
		this.childs.push(element)
		this.content.appendChild(element.root)
	}
	getGroup(id){
		return this.childs.find(el=>el.id == id)
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
		this.title.innerHTML = this.title_data[this.language]
		this.description = this.description_data ? (this.description_data[this.language] ? this.description_data[this.language] : "") : ""
		this.author = mod_info.author || ""
		this.root.appendChild(this.input)
		this.root.appendChild(this.title)

		this.root.addEventListener("mouseover", _=>{
			document.querySelector("#mod-image").src = this.image
			document.querySelector("#mod-title").innerHTML = this.title_data[this.language]
			document.querySelector("#mod-description").innerHTML = this.description
			if (this.author){
				document.querySelector("#mod-author").innerHTML = `
					<span>${LOCALES['author'][this.language]}</span>
					<span>${this.author}</span>
				`
			}
		})
		this.root.addEventListener("mouseleave", _=>{
			document.querySelector("#mod-image").src = ""
			document.querySelector("#mod-title").innerHTML = ""
			document.querySelector("#mod-description").innerHTML = ""
			document.querySelector("#mod-author").innerHTML = ""
		})
	}
	get(){
		if (this.input.checked){
			return this.id
		}
	}
	changeLanguage(new_language){
		this.language = new_language
		this.title.innerHTML = this.title_data[new_language]
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
