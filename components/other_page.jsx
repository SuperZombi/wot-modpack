const OtherPage = ({showHiddenMods, setShowHiddenMods}) => {
	const [langStats, setLangStats] = React.useState({})
	const [clientStats, setClientStats] = React.useState({})
	const [gameVersionStats, setGameVersionStats] = React.useState({})
	const [layoutStats, setLayoutStats] = React.useState({})
	const {lang} = useApp()

	React.useEffect(_=>{
		loadStatsPage("1884858162", data=>setLangStats(statsAsNumber(data)))
		loadStatsPage("224300057", data=>setClientStats(statsAsNumber(data)))
		loadStatsPage("379781718", data=>setGameVersionStats(statsAsNumber(data)))
		loadStatsPage("871377866", data=>setLayoutStats(statsAsNumber(data)))
	}, [])

	const languageDisplayNames = React.useMemo(() => {
		if (typeof Intl === "undefined" || typeof Intl.DisplayNames !== "function") {
			return null
		}
		return new Intl.DisplayNames([lang], { type: "language" })
	}, [lang])

	const formatLanguageName = code => {
		const sourceCode = String(code || "").trim()
		if (!sourceCode) { return code }
		const normalizedCode = sourceCode.toLowerCase().replace(/_/g, "-")
		const languageCode = normalizedCode.split("-")[0]
		const localizedLabel = languageDisplayNames?.of(languageCode)
		if (!localizedLabel || localizedLabel === languageCode) {
			return sourceCode
		}
		return localizedLabel.charAt(0).toLocaleUpperCase(lang) + localizedLabel.slice(1)
	}

	const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

	return (
		<React.Fragment>
			<div className="container" align="center">
				<label>
					<input type="checkbox" checked={showHiddenMods}
						onChange={e=>setShowHiddenMods(e.target.checked)}
						style={{marginRight: "0.5em"}}
					/>
					<span>{<LANG id="showHiddenMods"/>}</span>
				</label>
			</div>
			<div className="container row" style={{gap: "2rem"}}>
				<OtherStatsTable
					caption={<LANG id="languagesTable"/>}
					data={langStats}
					nameFormatter={formatLanguageName}
				/>
				<OtherStatsTable
					caption={<LANG id="gameVersion"/>}
					data={gameVersionStats}
				/>
				<OtherStatsTable
					caption={<LANG id="clientsTable"/>}
					data={clientStats}
					nameFormatter={capitalize}
				/>
				<OtherStatsTable
					caption={<LANG id="layout"/>}
					data={layoutStats}
					nameFormatter={capitalize}
				/>
			</div>
		</React.Fragment>
	)
}

const OtherStatsTable = ({caption, data, nameFormatter=null}) => {
	const validEntries = Object.entries(data || {}).filter(([key, value]) => {
		return !isNaN(Number(value)) && value !== null;
	})
	const total = validEntries.reduce((sum, [_, value]) => sum + Number(value), 0)

	return (
		<table border="1">
			<caption>{caption}</caption>
			<tbody>
				{validEntries.length > 0 ? (
					<React.Fragment>
					{validEntries.map(([name, count], index) => {
						const percent = total > 0 ? ((Number(count) / total) * 100).toFixed(1) : "0.0"
						return (
							<tr key={index}>
								<td>{nameFormatter ? nameFormatter(name) : name}</td>
								<td style={{textAlign: "right"}}>{count}</td>
								<td style={{textAlign: "right"}}>{percent}%</td>
							</tr>
						)
					})}
					</React.Fragment>
				) : (
					<tr><td colSpan="3" style={{textAlign: "center"}}>
						{Object.keys(data || {}).length > 0 ? <LANG id="error" /> : <LANG id="loading" />}
					</td></tr>
				)}
			</tbody>
		</table>
	)
}
