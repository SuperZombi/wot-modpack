const App = () => {
	const [mods, setMods] = React.useState([])
	const [groups, setGroups] = React.useState([])

	const [stats, setStats] = React.useState([])
	const [downloadsStats, setDownloadsStats] = React.useState({})

	const [showPreview, setShowPreview] = React.useState(false)
	const [previewData, setPreviewData] = React.useState({})
	const [selected, setSelected] = React.useState(null)

	const [tab, setTab] = React.useState("")
	const [showHiddenMods, setShowHiddenMods] = React.useState(false)

	React.useEffect(() => {
		fetch('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
		.then(r=>{
			if (!r.ok) {
				throw new Error(`HTTP error!: ${r.status}`)
			}
			return r.json()
		}).then(data=>{
			setMods(data.mods)
			setGroups(data.groups)
		})
		.catch(console.error)
	}, [])
	React.useEffect(() => {
		loadStatsPage(setStats)
	}, [])
	React.useEffect(() => {
		setDownloadsStats(countBySplitField(stats, "Selected mods"))
	}, [stats])

	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const id = params.get("id")
		if (id){ setSelected(id) }
		const tab = params.get("tab")
		if (tab){ setTab(tab) } else { setTab("home") }
	}, [])
	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		if (selected !== null) {
			params.set("id", selected)
		} else {
			params.delete("id")
		}
		if (tab !== "home"){
			params.set("tab", tab)
		} else {
			params.delete("tab")
		}
		const q = params.toString()
		const newUrl = q ? window.location.pathname + "?" + q : window.location.pathname;
		history.replaceState(null, "", newUrl)
	}, [selected, tab])
	React.useEffect(() => {
		if (!selected || mods.length === 0) return;
		const mod = mods.find(m => m.id == selected);
		if (!mod){
			setSelected(null)
			setTab("404")
			return
		}
		onPreview(mod)
	}, [selected, mods])
	
	const onPreview = mod=>{
		setPreviewData(mod)
		setSelected(mod.id)
		setShowPreview(true)
	}
	const onClosePreview = _=>{
		setPreviewData({})
		setShowPreview(false)
		setSelected(null)
	}

	function collectFiles(mod_id, collected = [], visited = []){
		if (visited.includes(mod_id)) { return; }
		visited.push(mod_id);
		const mod = mods.find(m => m.id === mod_id);
		if (!mod) { return; }
		if (Array.isArray(mod.files)) {
			for (const file of mod.files) {
				collected.push({
					...file,
					url: file.url.replace(
						"https://github.com/SuperZombi/wot-modpack/raw",
						"https://raw.githubusercontent.com/SuperZombi/wot-modpack"
					)
				})
			}
		}
		if (Array.isArray(mod.requires)) {
			for (const dep of mod.requires) {
				collectFiles(dep, collected, visited);
			}
		}
		return collected;
	}

	return (
		<React.Fragment>
			<Header
				tab={tab} setTab={setTab}
			/>

			{tab == "home" ? (
				<Home
					mods_count={mods.filter(mod => mod.title).length}
					total_installs={stats.length}
					setTab={setTab}
				/>
			) : tab == "mods" ? (
				<ModsList mods={mods} groups={groups}
					onPreview={onPreview}
					showHidden={showHiddenMods}
				/>
			) : tab == "stats" ? (
				<ModStats mods={mods} stats={downloadsStats} onPreview={onPreview}/>
			) : tab == "other" ? (
				<OtherPage
					showHiddenMods={showHiddenMods} setShowHiddenMods={setShowHiddenMods}
					stats={stats}
				/>
			) : tab == "404" ? (
				<NotFound onClick={_=>setTab("home")}>
					<i className="fa-solid fa-home"></i>
					<LANG id="homeTab"/>
				</NotFound>
			) : null}

			{showPreview && (
				<ModPreview
					onClosePreview={onClosePreview}
					previewData={previewData}
					collectFiles={collectFiles}
					stats={downloadsStats}
					stats_csv={stats}
				/>
			)}
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById("root")).render(
	<AppProvider>
		<App/>
	</AppProvider>
)

const NotFound = ({ children, onClick }) => {
	return (
		<div className="container" style={{paddingBottom: 0}}>
			<Reveal className="line" style={{gap: 0}}>
				<img src="web/images/empty-box.png" alt="No mods found"
					height="128" draggable={false} style={{userSelect: "none"}}
				/>
				<h3><LANG id="nothingFounded"/></h3>
			</Reveal>
			{children && (
				<Reveal delay={2} style={{textAlign: "center", marginBottom: "1rem"}}>
					<button className="button shine" onClick={onClick}>
						{children}
					</button>
				</Reveal>
			)}
		</div>
	)
}

function loadStatsPage(callback){
	const DOC_ID = "1GEMJfZxjUYmQAg-cDcQ7DGNjsX6pASMp9hQ1T0tVRfo"
	const SHEET_ID = "342255871"
	fetch(`https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${SHEET_ID}`)
	.then(r=>{
		if (!r.ok) {
			throw new Error(`HTTP error!: ${r.status}`)
		}
		return r.text()
	}).then(csv=>{
		const result = Papa.parse(csv, {
			header: true
		})
		callback(result.data)
	})
	.catch(console.error)
}
