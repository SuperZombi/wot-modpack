var currentLang;
let LOCALES = {
	"author": {
		"en": "Author",
		"ru": "Автор",
		"uk": "Автор"
	},
	"version": {
		"en": "Version:",
		"ru": "Версия:",
		"uk": "Версія:"
	},
	"settings": {
		"en": "Settings",
		"ru": "Настройки",
		"uk": "Налаштування"
	},
	"language": {
		"en": "Language",
		"ru": "Язык",
		"uk": "Мова"
	},
	"report_bug": {
		"en": "Report a bug",
		"ru": "Сообщить об ошибке",
		"uk": "Повідомити про помилку"
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
	"reset": {
		"en": "Reset",
		"ru": "Сбросить",
		"uk": "Скинути"
	},
	"reset_confirm": {
		"en": "Reset all selected mods?",
		"ru": "Сбросить все выбранные моды?",
		"uk": "Скинути всі вибрані моди?"
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
	},
	"failed_get_client": {
		"en": "Failed to get client info!",
		"ru": "Не удалось получить информацию о клиенте!",
		"uk": "Не вдалося отримати інформацію про клієнта!"
	},
	"failed_to_install": {
		"en": "Failed to install the following mods",
		"ru": "Не удалось установить следующие моды",
		"uk": "Неможливо встановити наступні моди"
	},
	"download": {
		"en": "Download",
		"ru": "Скачать",
		"uk": "Завантажити"
	},
	"update_available": {
		"en": "Update available!",
		"ru": "Доступно обновление!",
		"uk": "Доступне оновлення!"
	},
	"save_selected_mods": {
		"en": "Remember selected mods",
		"ru": "Запомнить выбранные моды",
		"uk": "Запам'ятати вибрані моди"
	},
	"cache_size": {
		"en": "Cache size",
		"ru": "Размер кэша",
		"uk": "Розмір кешу"
	},
	"clear_cache": {
		"en": "Clear cache",
		"ru": "Очистить кэш",
		"uk": "Очистити кеш"
	},
	"use_cache": {
		"en": "Use cache",
		"ru": "Использовать кэш",
		"uk": "Використовувати кеш",
	},
	"megabytes": {
		"en": "Mb",
		"ru": "Мб",
		"uk": "Мб"
	}
}

function detect_lang(){
	let user_lang = navigator.language.slice(0,2).toLowerCase()
	return ['en', 'ru', 'uk'].includes(user_lang) ? user_lang : "en"
}
function initLanguage(){
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
}
function LANG(code){
	return LOCALES[code][currentLang]
}
