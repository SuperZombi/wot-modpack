const App = () => {
	const [mods, setMods] = React.useState([])
	const [groups, setGroups] = React.useState([])

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
		document.documentElement.classList.toggle("home-snap", tab === "home")
		document.body.classList.toggle("home-snap", tab === "home")
		return () => {
			document.documentElement.classList.remove("home-snap")
			document.body.classList.remove("home-snap")
		}
	}, [tab])
	React.useEffect(() => {
		if (!selected || mods.length === 0) return;
		const mod = mods.find(m => m.id == selected);
		if (!mod){
			setSelected(null)
			return
		}
		onPreview(mod)
	}, [selected, mods])
	
	const onPreview = mod=>{
		setPreviewData({
			id: mod.id,
			title: mod.title,
			description: mod.description,
			author: mod.author,
			image: mod.image,
			audio: mod.audio,
			version: mod.ver,
		})
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
					setTab={setTab}
				/>
			) : tab == "mods" ? (
				<ModsList mods={mods} groups={groups}
					onPreview={onPreview}
					showHidden={showHiddenMods}
				/>
			) : tab == "stats" ? (
				<ModStats mods={mods} onPreview={onPreview}/>
			) : tab == "other" ? (
				<OtherPage
					showHiddenMods={showHiddenMods} setShowHiddenMods={setShowHiddenMods}
				/>
			) : null}

			{showPreview && (
				<ModPreview
					onClosePreview={onClosePreview}
					previewData={previewData}
					collectFiles={collectFiles}
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

const statsPageCache = new Map();
function loadStatsPage(SHEET_ID, callback){
	const DOC_ID = "1GEMJfZxjUYmQAg-cDcQ7DGNjsX6pASMp9hQ1T0tVRfo"
	if (statsPageCache.has(SHEET_ID)) {
		return callback(statsPageCache.get(SHEET_ID))
	}
	fetch(`https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${SHEET_ID}`)
	.then(r=>{
		if (!r.ok) {
			throw new Error(`HTTP error!: ${r.status}`)
		}
		return r.text()
	}).then(text=>{
		const data = text.split("\n").map(line => line.trim().split(","))
		statsPageCache.set(SHEET_ID, data);
		callback(data)
	})
	.catch(console.error)
}
function statsAsNumber(array){
	return Object.fromEntries(array.map(([key, value]) => [key, Number(value)]))
}
