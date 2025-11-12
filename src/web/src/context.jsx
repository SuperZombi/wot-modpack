const AppContext = React.createContext();
function AppProvider({children}) {
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2)
	
	const [language, setLanguage] = React.useState(supportedLangs.includes(userLang) ? userLang : 'en')
	const [langData, setLangData] = React.useState({})
	const [matchClientLang, setMatchClientLang] = React.useState(true)
	const [useCache, setUseCache] = React.useState(true)
	const [modsLayout, setModsLayout] = React.useState("list")

	React.useEffect(() => {
		(async _=>{
			const settings = await eel.get_settings()()
			if ("lang" in settings){
				setLanguage(settings["lang"])
			}
			if ("match_client_lang" in settings){
				setMatchClientLang(settings["match_client_lang"])
			}
			if ("use_cache" in settings){
				setUseCache(settings["use_cache"])
			}
		})()
	}, [])

	React.useEffect(() => {
		fetch(`locales/${language}.json`).then(res => res.json()).then(setLangData);
		(async _=>{
			await eel.update_settings({"lang": language})()
		})()
	}, [language])
	React.useEffect(() => {
		(async _=>{
			await eel.update_settings({"match_client_lang": matchClientLang})()
		})()
	}, [matchClientLang])
	React.useEffect(() => {
		(async _=>{
			await eel.update_settings({"use_cache": useCache})()
		})()
	}, [useCache])

	const value = {
		language, setLanguage, langData,
		matchClientLang, setMatchClientLang,
		useCache, setUseCache,
		modsLayout, setModsLayout
	}
	return (
		<AppContext.Provider value={value}>
			{children}
		</AppContext.Provider>
	)
}
function useApp() {
	return React.useContext(AppContext)
}
function LANG({ id, vars = {} }) {
	const { langData } = useApp()
	let text = langData[id] || id;
	for (const key in vars) {
		text = text.replaceAll(`{${key}}`, vars[key]);
	}
	return <span dangerouslySetInnerHTML={{ __html: text }}/>
}
function replaceFlags(text) {
	const parts = text.split(/(:flag_[a-z]{2}:)/gi)
	return parts.map((part, i) => {
		const match = part.match(/^:flag_([a-z]{2}):$/i)
		if (match) {
			const code = match[1].toLowerCase()
			return <img className="flag" src={`/images/flags/${code}.svg`} draggable={false}/>
		}
		return part
	})
}
