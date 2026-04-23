const Header = ({tab, setTab}) => {
	const {lang, langData, setLang} = useApp()
	React.useEffect(() => {
		const tabName = {
			"home": langData?.["homeTab"]?.[lang],
			"mods": langData?.["modsTab"]?.[lang],
			"stats": langData?.["statsTab"]?.[lang],
			"other": langData?.["otherStatsTab"]?.[lang]
		}
		document.title = `Web Modpack${tabName[tab] ? ` • ${tabName[tab]}` : ''}`
	}, [tab, lang, langData])

	return (
		<header className="container">
			<button className="button shine tab-btn left-button"
				onClick={_=>setTab("home")}
				disabled={tab === "home"}
			>
				<img src="web/images/favicon.png" alt="Web Modpack logo" draggable={false}/>
				<span>Web Modpack</span>
			</button>
				<select className="button tab-btn" name="lang" value={lang}
					onChange={e=>setLang(e.target.value)}
				>
					<option value="en">EN</option>
					<option value="ru">RU</option>
					<option value="uk">UA</option>
				</select>
			<nav>
				<button className={`button shine tab-btn ${(tab == "mods" || tab == "popular") ? "active" : ""}`}
					disabled={tab === "mods" || tab === "popular"}
					onClick={_=>setTab("mods")}
				>
					<LANG id="modsTab"/>
				</button>
				<button className={`button shine tab-btn ${tab == "stats" ? "active" : ""}`}
					disabled={tab === "stats"}
					onClick={_=>setTab("stats")}
				>
					<LANG id="statsTab"/>
				</button>
			</nav>
		</header>
	)
}
