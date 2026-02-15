const Header = ({tab, setTab, lang, setLang}) => {
	React.useEffect(() => {
		const tabName = {
			"home": LANG.homeTab[lang],
			"mods": LANG.modsTab[lang],
			"stats": LANG.statsTab[lang],
			"other": LANG.otherStatsTab[lang],
		}
		document.title = `Web Modpack • ${tabName[tab]}`
	}, [tab, lang])

	return (
		<header className="container">
			<button className="button shine tab-btn left-button"
				onClick={_=>setTab("home")}
				disabled={tab === "home"}
			>
				<img src="web/images/favicon.png" draggable={false}/>
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
				<button className={`button shine tab-btn ${tab == "mods" ? "active" : ""}`}
					disabled={tab === "mods"}
					onClick={_=>setTab("mods")}
				>
					{LANG.modsTab[lang]}
				</button>
				<button className={`button shine tab-btn ${tab == "stats" ? "active" : ""}`}
					disabled={tab === "stats"}
					onClick={_=>setTab("stats")}
				>
					{LANG.statsTab[lang]}
				</button>
				<button className={`button shine tab-btn ${tab == "other" ? "active" : ""}`}
					disabled={tab === "other"}
					onClick={_=>setTab("other")}
				>
					{LANG.otherStatsTab[lang]}
				</button>
			</nav>
		</header>
	)
}
