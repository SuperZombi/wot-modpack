const AppContext = React.createContext();
function AppProvider({children}) {
	const [language, setLanguage] = React.useState("en")
	const [theme, setTheme] = React.useState("light")

	// React.useEffect(() => {
	// 	localStorage.setItem("language", language);
	// }, [language])

	const value = {
		language, setLanguage,
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

// function Example() {
// 	const { language, setLanguage, theme, setTheme } = useApp()
// 	return (
// 		<div>
// 			<p>Язык: {language}</p>
// 			<p>Тема: {theme}</p>
// 			<button onClick={() => setLanguage(language === "en" ? "ru" : "en")}>Сменить язык</button>
// 			<button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Сменить тему</button>
// 		</div>
// 	)
// }
