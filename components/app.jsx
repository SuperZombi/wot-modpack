const App = () => {
	const [mods, setMods] = React.useState([])
	const [groups, setGroups] = React.useState([])
	const [stats, setStats] = React.useState({})
	const [totalInstalls, setTotalInstalls] = React.useState(0)

	const [showPreview, setShowPreview] = React.useState(false)
	const [previewData, setPreviewData] = React.useState({})
	const [selected, setSelected] = React.useState(null)

	const [tab, setTab] = React.useState("home")
	const [showHiddenMods, setShowHiddenMods] = React.useState(false)
	
	const supportedLangs = ["en", "ru", "uk"]
	const getInitialLang = () => {
		const savedLang = localStorage.getItem("lang")
		if (savedLang && supportedLangs.includes(savedLang)) {
			return savedLang
		}
		const userLang = navigator.language?.slice(0, 2)
		return supportedLangs.includes(userLang) ? userLang : "en"
	}
	const [lang, setLang] = React.useState(getInitialLang)
	React.useEffect(() => {
		localStorage.setItem("lang", lang)
	}, [lang])

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
		loadStatsPage("2089462923", data=>setStats(statsAsNumber(data)))
		loadStatsPage("342255871", data=>setTotalInstalls(Math.max(0, data.length-1)))
	}, [])

	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const id = params.get("id")
		if (id){ setSelected(id) }
		const tab = params.get("tab")
		if (tab){ setTab(tab) }
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
			return
		}
		onPreview(mod)
	}, [selected, mods, lang])

	const onPreview = mod=>{
		setPreviewData({
			id: mod.id,
			title: replaceFlags(mod.title?.[lang]),
			description: mod.description?.[lang],
			author: mod.author,
			image: mod.image,
			audio: mod.audio,
			version: mod.ver,
			on_download: _=>{
				const files = collectFiles(mod.id)
				buildZip(mod.id, files)
			}
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
				lang={lang} setLang={setLang}
			/>

			{tab == "home" ? (
				<Home
					mods_count={mods.filter(mod => mod.title).length}
					totalInstalls={totalInstalls}
					lang={lang}
				/>
			) : tab == "mods" ? (
				<ModsList mods={mods} groups={groups}
					lang={lang} onPreview={onPreview}
					showHidden={showHiddenMods}
				/>
			) : tab == "stats" ? (
				<ModStats mods={mods} stats={stats} lang={lang} onPreview={onPreview}/>
			) : tab == "other" ? (
				<OtherPage lang={lang}
					showHiddenMods={showHiddenMods} setShowHiddenMods={setShowHiddenMods}
				/>
			) : null}

			{showPreview && (
				<ModPreview lang={lang}
					onClosePreview={onClosePreview}
					previewData={previewData}
					stats={stats}
				/>
			)}
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>)



async function buildZip(filename, files) {
	const zip = new JSZip();
	const PATHS = {
		mods: ["mods", "1.0.0"],
		res_mods: ["res_mods", "1.0.0"],
		configs: ["mods", "configs"]
	}
	for (const file of files) {
		const response = await fetch(file.url);
		if (!response.ok) continue;

		const blob = await response.blob();
		const filename = file.url.split("/").pop();
		const isZip = filename.endsWith(".zip");

		const basePath = PATHS[file.dest];
		if (!basePath) continue;

		const baseParts = [
			...basePath,
			file.folder
		].filter(Boolean);

		if (isZip) {
			const innerZip = await JSZip.loadAsync(blob);
			for (const [innerPath, innerFile] of Object.entries(innerZip.files)) {
				if (innerFile.dir) continue;
				const innerContent = await innerFile.async("blob");
				const finalPath = [
					...baseParts,
					innerPath
				].join("/");
				zip.file(finalPath, innerContent);
			}
		} else {
			const finalPath = [
				...baseParts,
				filename
			].join("/");
			zip.file(finalPath, blob);
		}
	}
	const content = await zip.generateAsync({ type: "blob" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(content);
	link.download = `${filename}.zip`;
	link.click();
}

function replaceFlags(text) {
	if (!text){return}
	const parts = text.split(/(:flag_[a-z]{2}:)/gi)
	return parts.map((part, i) => {
		const match = part.match(/^:flag_([a-z]{2}):$/i)
		if (match) {
			const code = match[1].toLowerCase()
			return <span key={i} className={`fi fi-${code}`} style={{verticalAlign: "middle"}}></span>
		}
		return part
	})
}
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
