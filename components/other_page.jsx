const OtherPage = ({ lang, langStats, clientStats, showHiddenMods, setShowHiddenMods }) => {
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

	return (
		<React.Fragment>
			<div className="container" align="center">
				<label>
					<input type="checkbox" checked={showHiddenMods}
						onChange={e=>setShowHiddenMods(e.target.checked)}
						style={{marginRight: "0.5em"}}
					/>
					<span>{LANG.showHiddenMods[lang]}</span>
				</label>
			</div>
			<div className="container row" style={{gap: "2rem"}}>
				<OtherStatsTable
					caption={LANG.languagesTable[lang]}
					data={langStats}
					nameFormatter={formatLanguageName}
				/>
				<OtherStatsTable caption={LANG.clientsTable[lang]} data={clientStats}/>
			</div>
		</React.Fragment>
	)
}

const OtherStatsTable = ({caption, data, nameFormatter=null}) => {
	const values = Object.values(data)
	const total = values.reduce((sum, value) => sum + Number(value), 0)

	return (
		<table border="1">
			<caption>{caption}</caption>
			<tbody>
				{Object.keys(data).length > 0 ? (
					<React.Fragment>
					{Object.entries(data).map(([name, count], index)=>{
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
				) : <tr><td>Loading...</td></tr>}
			</tbody>
		</table>
	)
}
