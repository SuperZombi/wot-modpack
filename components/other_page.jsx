const OtherPage = ({showHiddenMods, setShowHiddenMods, stats}) => {
	const [langStats, setLangStats] = React.useState({})
	const [clientStats, setClientStats] = React.useState({})
	const [gameVersionStats, setGameVersionStats] = React.useState({})
	const [layoutStats, setLayoutStats] = React.useState({})
	const [timelineStats, setTimelineStats] = React.useState({})
	const {lang, langData} = useApp()

	React.useEffect(_=>{
		setLangStats(countByField(stats, "WoT lang"))
		setClientStats(countByField(stats, "WoT type"))
		setGameVersionStats(countByField(stats, "WoT version", null, (a, b)=>compareVersions(b[0],a[0])))
		setLayoutStats(countByField(stats, "Layout"))
		setTimelineStats(countByTimestamp(stats, "Отметка времени"))
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
	const formatDate = date => {
		const parsedDate = parseRuTimestamp(date)
		return parsedDate.toLocaleString(lang, {
			day: 'numeric',
			month: 'short'
		})
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
					<label className="switch-control">
						<input
							type="checkbox"
							checked={showHiddenMods}
							onChange={e=>setShowHiddenMods(e.target.checked)}
						/>
						<span className="switch-slider" aria-hidden="true"></span>
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
				<div className="row" style={{width: "100%"}}>
					<StatsChart
						type="line"
						data={timelineStats}
						caption={langData?.["installsTimeline"]?.[lang]}
						nameFormatter={formatDate}
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
					...(type === "bar" && { borderRadius: 6, borderWidth: 1 }),
					...(type === "doughnut" && { borderWidth: 0 }),
					...(type === "line" && { fill: false, tension: 0.2 }),
				}],
			},
			options:{
				responsive:true,
				maintainAspectRatio:false,
				indexAxis: type === "bar" ? "y" : "x",
				...((type === "line" || type === "bar") && {
					scales: {
						x: {
							min: 0,
							ticks: { stepSize: 1 }
						},
						y: {
							min: 0,
							ticks: { stepSize: 1 }
						}
					}
				}),
				plugins:{
					legend: {
						display: type === "doughnut" ? true : false,
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
	const height = type === "bar" ? (Object.keys(validEntries).length * rowHeight + 60) : 300
	return <div style={{
		height: height + "px",
		width: type === "line" ? "100%" : undefined
	}}>
		<canvas ref={canvasRef}/>
	</div>
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

function countByTimestamp(data, keyField) {
	return data.reduce((acc, row) => {
		const parsedDate = parseRuTimestamp(row[keyField])
		if (!parsedDate) return acc
		const year = String(parsedDate.getUTCFullYear())
		const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0")
		const day = String(parsedDate.getUTCDate()).padStart(2, "0")
		const key = `${day}.${month}.${year}`
		acc[key] = (acc[key] || 0) + 1
		return acc
	}, {})
}
function parseRuTimestamp(value) {
	const text = String(value || "").trim()
	const match = text.match(
		/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
	)
	if (!match) { return null }
	const [
		_,
		day,
		month,
		year,
		hour = "0",
		minute = "0",
		second = "0"
	] = match

	return new Date(Date.UTC(
		Number(year),
		Number(month) - 1,
		Number(day),
		Number(hour),
		Number(minute),
		Number(second)
	))
}
