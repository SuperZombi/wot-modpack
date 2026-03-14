const OtherPage = ({ lang, langStats, clientStats, showHiddenMods, setShowHiddenMods }) => {
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
			<div className="container row">
				<OtherStatsTable caption={LANG.languagesTable[lang]} data={langStats}/>
				<OtherStatsTable caption={LANG.clientsTable[lang]} data={clientStats}/>
			</div>
		</React.Fragment>
	)
}

const OtherStatsTable = ({caption, data}) => {
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
								<td>{name}</td>
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
