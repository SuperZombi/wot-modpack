class ModsList{
	constructor(parent){
		this.root = parent
		this.childs = []
	}
	add(element){
		this.childs.push(element)
		this.root.appendChild(element.root)
	}
	get(){
		return this.childs.map(child=>child.get()).flat(Infinity)
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
}
function makeCategory(name, image){
	let x = new Details()
	x.root.classList.add("category")
	x.summary.innerHTML += `
		<img src="${image}">
		<span>${name}</span>
	`
	return x
}

class Checkbox{
	constructor(id, text, type="checkbox", group_id=null){
		this.id = id
		this.root = document.createElement("label")
		this.root.className = "mod hover"
		this.root.setAttribute("id", id)
		this.input = document.createElement("input")
		this.input.type = type
		this.input.className = "hover"
		if (group_id){
			this.input.name = group_id
		}
		this.text = document.createElement("span")
		this.text.innerHTML = text
		this.root.appendChild(this.input)
		this.root.appendChild(this.text)
	}
	get(){
		if (this.input.checked){
			return this.id
		}
	}
}

class Group{
	constructor(id, text){
		this.id = id
		this.details = new Details()
		this.details.root.classList.add("group")
		this.name = document.createElement("span")
		this.name.innerHTML = text
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
}
