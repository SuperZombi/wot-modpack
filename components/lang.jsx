const AppContext = React.createContext();

function AppProvider({children}) {
    const supportedLangs = ["en", "ru", "uk"]
	const getInitialLang = () => {
		const savedLang = localStorage.getItem("lang")
		if (savedLang && supportedLangs.includes(savedLang)) {
			return savedLang
		}
		const userLang = navigator.language?.slice(0, 2)
		return supportedLangs.includes(userLang) ? userLang : "en"
	}
	const [lang, setLang] = React.useState(getInitialLang)
	React.useEffect(() => {
		localStorage.setItem("lang", lang)
	}, [lang])

    const [langData, setLangData] = React.useState({})
	React.useEffect(() => {
		fetch('web/lang.json').then(res => res.json()).then(setLangData);
	}, [])

	const value = {
		lang, setLang, langData
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
function LANG({ id }) {
	const { lang, langData } = useApp()
	const text = langData?.[id]?.[lang] || id;
	return text
}
