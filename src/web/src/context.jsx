const AppContext = React.createContext();
function AppProvider({children}) {
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2)
	const defaultSettings = {
		language: supportedLangs.includes(userLang) ? userLang : 'en',
		match_client_lang: true,
		use_cache: true,
		layout: "list",
		layout_tooltip: true,
		data_collection: false,
		first_install: true
	}
	const [settings, setSettings] = React.useState(defaultSettings)
	React.useEffect(() => {
		(async () => {
			const loaded = await eel.get_settings()()
			setSettings(prev => ({ ...prev, ...loaded }))
		})()
	}, [])
	const updateSetting = (key, value) => {
		setSettings(prev => ({ ...prev, [key]: value }));
		(async _=>{
			await eel.update_settings({[key]: value})()
		})()
	}
	
	const [langData, setLangData] = React.useState({})
	React.useEffect(() => {
		fetch(`locales/${settings.language}.json`).then(res => res.json()).then(setLangData);
	}, [settings.language])

	const value = {
		langData, settings, updateSetting
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
			return <img key={i} className="flag" src={`/images/flags/${code}.svg`} draggable={false}/>
		}
		return part
	})
}
