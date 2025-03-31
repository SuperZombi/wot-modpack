var currentLang;
let LOCALES = {
	"author": {
		"en": "Author",
		"ru": "Автор",
		"uk": "Автор"
	},
	"select_game_folder": {
		"en": "Select game folder",
		"ru": "Выберите папку с игрой",
		"uk": "Виберіть папку гри"
	},
	"next": {
		"en": "Next",
		"ru": "Далее",
		"uk": "Далі"
	},
	"back": {
		"en": "Back",
		"ru": "Назад",
		"uk": "Назад"
	},
	"custom_game_folder": {
		"en": "Custom",
		"ru": "Выбрать",
		"uk": "Обрати"
	},
	"remove_all_mods": {
		"en": "Remove all installed mods",
		"ru": "Удалить все установленные моды",
		"uk": "Видалити всі встановлені моди"
	},
	"remove_mod_configs": {
		"en": "Delete mod configs",
		"ru": "Удалить настройки модов",
		"uk": "Видалити налаштування модів"
	},
	"selected_mods": {
		"en": "Selected Mods:",
		"ru": "Выбранные моды:",
		"uk": "Вибрані моди:"
	},
	"nothing_selected": {
		"en": "Nothing selected",
		"ru": "Ничего не выбрано",
		"uk": "Нічого не вибрано"
	},
	"installing_mods": {
		"en": "Installing modifications",
		"ru": "Установка модификаций",
		"uk": "Встановлення модифікацій"
	},
	"installed_success": {
		"en": "Mods installed successfully!",
		"ru": "Моды успешно установлены!",
		"uk": "Моди успішно встановлено!"
	},
	"home": {
		"en": "Home",
		"ru": "На главную",
		"uk": "На головну"
	},
	"mods_info_parse_fail": {
		"en": "Failed to load mods info. Try again latter.",
		"ru": "Не удалось загрузить информацию о модах. Попробуйте позже.",
		"uk": "Не вдалося завантажити інформацію про моди. Спробуйте пізніше."
	}
}

function detect_lang(){
	let user_lang = navigator.language.slice(0,2).toLowerCase()
	return ['en', 'ru', 'uk'].includes(user_lang) ? user_lang : "en"
}
function initLanguage(){
	currentLang = detect_lang()
	document.querySelectorAll("[lang_]").forEach(el=>{
		el.innerHTML = LANG(el.getAttribute("lang_"))
	})
}
function LANG(code){
	return LOCALES[code][currentLang]
}
