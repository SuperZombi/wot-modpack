var currentLang;
var LOCALES;

function detect_lang(){
	let user_lang = navigator.language.slice(0,2).toLowerCase()
	return ['en', 'ru', 'uk'].includes(user_lang) ? user_lang : "en"
}
async function initLanguage(){
	LOCALES = await eel.get_locales()()
	currentLang = currentLang || detect_lang()
	let lang_el = document.querySelector('.setting_element[name="language"]')
	lang_el.value = currentLang
	lang_el.onchange = _=>{
		currentLang = lang_el.value
		localizePage()
		modsManager ? modsManager.changeLanguage(lang_el.value) : null
	}
	localizePage()
}
function localizePage(){
	document.querySelectorAll("[lang_]").forEach(el=>{
		el.innerHTML = LANG(el.getAttribute("lang_"))
	})
	document.querySelectorAll("[lang_title]").forEach(el=>{
		el.title = LANG(el.getAttribute("lang_title"))
	})
}
function LANG(code){
	return LOCALES[currentLang][code]
}
