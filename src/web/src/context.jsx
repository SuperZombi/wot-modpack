const AppContext = React.createContext();
function AppProvider({children}) {
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2)
	
	const [language, setLanguage] = React.useState(supportedLangs.includes(userLang) ? userLang : 'en')
	const [theme, setTheme] = React.useState("light")
	const [langData, setLangData] = React.useState({})

	React.useEffect(() => {
		fetch(`locales/${language}.json`).then(res => res.json()).then(setLangData)
	}, [language])

	const value = {
		language, setLanguage, langData,
		theme, setTheme
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
			return <span key={i} className={`fi fi-${code}`}></span>
		}
		return part
	})
}