const OtherPage = ({showHiddenMods, setShowHiddenMods, stats}) => {
	const [langStats, setLangStats] = React.useState({})
	const [clientStats, setClientStats] = React.useState({})
	const [gameVersionStats, setGameVersionStats] = React.useState({})
	const [layoutStats, setLayoutStats] = React.useState({})
	const {lang, langData} = useApp()

	React.useEffect(_=>{
		setLangStats(countByField(stats, "WoT lang"))
		setClientStats(countByField(stats, "WoT type"))
		setGameVersionStats(countByField(stats, "WoT version", null, (a, b)=>compareVersions(b[0],a[0])))
		setLayoutStats(countByField(stats, "Layout"))
	}, [stats])

	const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

	const languageDisplayNames = (
		typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
	) ? (
		new Intl.DisplayNames([lang], { type: "language" })
	) : null

	const formatLanguageName = code => {
		const sourceCode = String(code || "").trim()
		if (!sourceCode) { return code }
		const languageCode = sourceCode.toLowerCase().replace(/_/g, "-").split("-")[0]
		const localizedLabel = languageDisplayNames?.of(languageCode)
		if (!localizedLabel || localizedLabel === languageCode) {
			return sourceCode
		}
		return capitalize(localizedLabel) 
	}

	const layout_type = {
		"grid": langData?.["layout_grid"]?.[lang],
		"list": langData?.["layout_list"]?.[lang]
	}

	return (
		<React.Fragment>
			<div className="container" align="center">
				<div className="row">
					<a className="button shine" href="https://wgmods.net/7156/" target="_blank">
						<i className="fa-solid fa-globe"></i>
						<span>WGmods</span>
					</a>
					<a className="button shine" href="https://github.com/SuperZombi/wot-modpack" target="_blank">
						<i className="fa-brands fa-github"></i>
						<span>GitHub</span>
					</a>
				</div>
				<div className="row" style={{marginTop: "1.5rem"}}>
					<label>
						<input type="checkbox" checked={showHiddenMods}
							onChange={e=>setShowHiddenMods(e.target.checked)}
							style={{marginRight: "0.5em"}}
						/>
						<span>{<LANG id="showHiddenMods"/>}</span>
					</label>
				</div>
			</div>
			<div className="container line" style={{gap: "2rem"}}>
				<div className="row">
					<StatsChart
						data={langStats}
						caption={langData?.["languagesTable"]?.[lang]}
						nameFormatter={formatLanguageName}
					/>
					<StatsChart
						data={gameVersionStats}
						caption={langData?.["gameVersion"]?.[lang]}
					/>
				</div>
				<div className="row">
					<StatsChart
						type="doughnut"
						data={clientStats}
						caption={langData?.["clientsTable"]?.[lang]}
						nameFormatter={capitalize}
					/>
					<StatsChart
						type="doughnut"
						data={layoutStats}
						caption={langData?.["layout"]?.[lang]}
						nameFormatter={val=>layout_type[val] || val}
					/>
				</div>
			</div>
		</React.Fragment>
	)
}

const StatsChart = ({
	data,
	type="bar",
	caption=null,
	nameFormatter=null
}) => {
	const canvasRef = React.useRef(null)
	const validEntries = Object.fromEntries(
		Object.entries(data).filter(([k,v]) => !isNaN(Number(v)) && v !== null)
	)
	React.useEffect(()=>{
		const labels = nameFormatter ? Object.keys(validEntries).map(nameFormatter) : Object.keys(validEntries)
		const values = Object.values(validEntries)
		const total = values.reduce((a,b)=>a+b,0)

		const chart = new Chart(canvasRef.current,{
			type:type,
			data:{
				labels,
				datasets: [{
					data: values,
					borderRadius: type === "bar" ? 6 : 0,
					borderWidth: type === "bar" ? 1 : 0,
				}]
			},
			options:{
				responsive:true,
				maintainAspectRatio:false,
				indexAxis:"y",
				plugins:{
					legend: {
						display: type === "bar" ? false : true,
						position: 'top',
						onClick: function(e, legendItem, legend) {}
					},
					title: {
						display: caption ? true : false,
						text: caption
					},
					tooltip:{
						callbacks:{
							label:function(context){
								const value = context.raw
								const percent = ((value/total)*100).toFixed(0)
								return `${value} (${percent}%)`
							}
						}
					}
				}
			}
		})
		return ()=>{chart.destroy()}
	},[data, caption])
	const rowHeight = 25
	const height = (type === "bar") ? (Object.keys(validEntries).length * rowHeight + 60) : 300
	return <div style={{height: height + "px"}}><canvas ref={canvasRef}/></div>
}

function countByField(data, keyField, filterFn = null, sortFn = null) {
	const counts = data.reduce((acc, row) => {
		if (filterFn && !filterFn(row)) return acc;
		const key = row[keyField];
		if (!key) return acc;
		acc[key] = (acc[key] || 0) + 1;
		return acc;
	}, {})
	return Object.fromEntries(
		Object.entries(counts).sort(sortFn || ((a, b) => b[1] - a[1]))
	)
}
function countBySplitField(data, keyField, separator = ",", filterFn = null, sortFn = null) {
	const allValues = data.flatMap(row => {
		if (filterFn && !filterFn(row)) return [];
		const value = row[keyField];
		if (!value) return [];
		return value.split(separator).map(v => v.trim()).filter(v => v !== "");
	})
	const counts = allValues.reduce((acc, val) => {
		acc[val] = (acc[val] || 0) + 1;
		return acc;
	}, {})
	return Object.fromEntries(
		Object.entries(counts).sort(sortFn || ((a, b) => b[1] - a[1]))
	)
}
