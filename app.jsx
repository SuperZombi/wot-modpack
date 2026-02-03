const App = () => {
	const [mods, setMods] = React.useState([])
	const [groups, setGroups] = React.useState([])
	const [stats, setStats] = React.useState({})
	const [langStats, setLangStats] = React.useState({})
	const [clientStats, setClientStats] = React.useState({})
	const [totalInstalls, setTotalInstalls] = React.useState(0)

	const [showPreview, setShowPreview] = React.useState(false)
	const [previewData, setPreviewData] = React.useState({})
	const [selected, setSelected] = React.useState(null)
	const [error, setError] = React.useState(false)

	const [tab, setTab] = React.useState("mods")
	
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2)
	const [lang, setLang] = React.useState(supportedLangs.includes(userLang) ? userLang : 'en')

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
		.catch(err=>{
			console.error(err)
			setError(true)
		})
	}, [])
	React.useEffect(() => {
		loadStatsPage('2089462923', data=>setStats(statsAsNumber(data)))
		loadStatsPage("342255871", data=>setTotalInstalls(Math.max(0, data.length-1)))
	}, [])
	
	React.useEffect(() => {
		if (tab == "mods"){
			document.title = "Web Modpack • Mods"
		}
		else if (tab == "stats"){
			document.title = "Web Modpack • Stats"
		}
		else if (tab == "otherStats"){
			document.title = "Web Modpack • Stats"
			if (Object.keys(langStats).length == 0){
				loadStatsPage("1884858162", data=>setLangStats(statsAsNumber(data)))
			}
			if (Object.keys(clientStats).length == 0){
				loadStatsPage("224300057", data=>setClientStats(statsAsNumber(data)))
			}
		}
	}, [tab])

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
		if (tab !== "mods"){
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
			title: replaceFlags(mod.title[lang]),
			description: mod.description?.[lang],
			author: mod.author,
			image: mod.image,
			audio: mod.audio,
			version: mod.ver
		})
		setSelected(mod.id)
		setShowPreview(true)
	}
	const onClosePreview = _=>{
		setPreviewData({})
		setShowPreview(false)
		setSelected(null)
	}

	return (
		<React.Fragment>
			<p align="center">
				<img src="favicon.png" height="128" draggable={false} style={{userSelect: "none"}}/>
			</p>
			<h1 align="center">
				<span>Web Modpack</span><br/>
			</h1>
			<div className="float-right">
				<select name="lang" value={lang} onChange={e=>setLang(e.target.value)} style={{fontSize: "12pt"}}>
					<option value="en">English</option>
					<option value="ru">Russian</option>
					<option value="uk">Ukranian</option>
				</select>
			</div>
			{tab == "mods" && (
				<div className="row" style={{marginBottom: "1.5rem", fontSize: "14px"}}>
					<StatCard value={mods.filter(mod => mod.title).length} duration={2000} label={LANG.mods_count[lang]}/>
					<StatCard value={totalInstalls} duration={2000} label={LANG.installations[lang]}/>
				</div>
			)}
			<div className="tabs">
				<span className={tab == "mods" ? "active" : null} onClick={_=>setTab("mods")}>
					{LANG.modsTab[lang]}
				</span>
				<span className={tab == "stats" ? "active" : null} onClick={_=>setTab("stats")}>
					{LANG.statsTab[lang]}
				</span>
				<span className={tab == "otherStats" ? "active" : null} onClick={_=>setTab("otherStats")}>
					{LANG.otherStatsTab[lang]}
				</span>
			</div>
			{mods.length > 0 ? (
				<React.Fragment>
					{tab == "stats" ? (
						<ModStats mods={mods} stats={stats} lang={lang} onPreview={onPreview}/>
					) : tab == "otherStats" ? (
						<React.Fragment>
							<div className="row" style={{marginTop: "6px"}}>
								<OtherStatsTable caption={LANG.languagesTable[lang]} data={langStats}/>
								<OtherStatsTable caption={LANG.clientsTable[lang]} data={clientStats}/>
							</div>
						</React.Fragment>
					) : (
						<ModsList mods={mods} groups={groups} lang={lang} onPreview={onPreview}/>
					)}
				</React.Fragment>
			) : (
				error ? <h3 align="center" style={{color: "red"}}>Failed to fetch!</h3> : (
				<h1 align="center">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="48">
						<path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1m0 19a8 8 0 1 1 8-8 8 8 0 0 1-8 8" opacity=".25"/>
						<path d="M10.14 1.16a11 11 0 0 0-9 8.92A1.6 1.6 0 0 0 2.46 12a1.5 1.5 0 0 0 1.65-1.3 8 8 0 0 1 6.66-6.61A1.4 1.4 0 0 0 12 2.69a1.57 1.57 0 0 0-1.86-1.53">
							<animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
						</path>
					</svg>
				</h1>)
			)}
			{showPreview && (
				<div className="popup" onClick={e=>e.target.classList.contains("popup") && onClosePreview()}>
					<div className="popup-content">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
							className="close" onClick={_=>onClosePreview()}
						>
							<path fill="#ec0000" d="M127.86 254.3C58.13 254.3 1.4 197.59 1.4 127.87 1.4 58.13 58.13 1.4 127.86 1.4s126.45 56.72 126.45 126.45c0 69.72-56.73 126.45-126.45 126.45"/>
							<path fill="#fff" d="M82.62 187.14a14.04 14.04 0 0 1-9.94-23.98l90.48-90.47a14.05 14.05 0 0 1 19.86 19.87l-90.46 90.47a14 14 0 0 1-9.94 4.11"/>
							<path fill="#fff" d="M173.1 187.14a14 14 0 0 1-9.94-4.11L72.69 92.56a14.05 14.05 0 1 1 19.87-19.87l90.47 90.47a14.04 14.04 0 0 1-9.94 23.98z"/>
						</svg>
						<h3 align="center">{previewData.title}</h3>
						<div className="image-container">
							<img src={previewData.image} draggable={false}/>
						</div>
						{previewData.author && (
							<span>{LANG.author[lang]}: {previewData.author}</span>
						)}
						{previewData.version && (
							<span>{LANG.version[lang]}: <code className="version">{previewData.version}</code></span>
						)}
						{Object.keys(stats).length > 0 && (
							<span>⬇️{LANG.downloads[lang]}: {stats[previewData.id] || 0}</span>
						)}
						{previewData.description && (
							<div className="mod-description">
								<hr/>
								<div dangerouslySetInnerHTML={{ __html: previewData.description}}/>
							</div>
						)}
						{previewData.audio && (
							<div style={{width: "100%"}}>
								<audio src={previewData.audio}
									controls autoPlay controlsList="nodownload"
									style={{width: "100%"}}
								/>
							</div>
						)}
						<button className="button" onClick={_=>share({
							title: previewData.title,
							mod_id: previewData.id
						})}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
								<path d="M49.8 3.3C24 3.3 3.1 24.2 3.1 50S24 96.7 49.8 96.7 96.5 75.8 96.5 50 75.6 3.3 49.8 3.3m5.8 64.2V55.8s-23.4-5.8-35 11.7c0-19.3 15.7-35 35-35V20.8L79 44.2z"/>
							</svg>
							<span>{LANG.share[lang]}</span>
						</button>
					</div>
				</div>
			)}
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>)

const ModsList = ({ mods, groups, lang, onPreview }) => {
	return (
		<div id="mods-list">
			{mods.map(mod => {
				if (!mod.title){return null}
				if (mod.group) {
					const group = groups.find(g => g.id === mod.group);
					if (!group) return null;

					const alreadyRendered = mods.findIndex(m => m.group === group.id) < mods.indexOf(mod);
					if (alreadyRendered) return null;

					const modsInGroup = mods.filter(m => m.group === group.id)
					return (
						<React.Fragment key={group.id}>
							{modsInGroup.map(gmod=>{
								return (
									<Mod key={gmod.id} mod={gmod} lang={lang} onPreview={onPreview}/>
								)
							})}
						</React.Fragment>
					)
				}
				return (
					<Mod key={mod.id} mod={mod} lang={lang} onPreview={onPreview}/>
				)
			})}
		</div>
	)
}

const ModStats = ({mods, stats, lang, onPreview}) => {
	const sortedMods = mods
		.filter(mod => mod.title)
		.map(mod => ({
			...mod,
			popularity: stats[mod.id] || 0
		}))
		.sort((a, b) => b.popularity - a.popularity)

	return (
		<div id="stats-list">
			{sortedMods.map(mod => (
				<div className="item" key={mod.id} onClick={_=>onPreview(mod)}>
					<img src={mod.image} draggable={false}/>
					<span>{replaceFlags(mod.title[lang])}</span>
					<span>{mod.popularity}</span>
				</div>
			))}
		</div>
	)
}
const OtherStatsTable = ({caption, data}) => {
	return (
		<table border="1">
			<caption>{caption}</caption>
			<tbody>
				{Object.keys(data).length > 0 ? (
					<React.Fragment>
					{Object.entries(data).map(([name, count], index)=>(
						<tr key={index}>
							<td>{name}</td>
							<td style={{textAlign: "right"}}>{count}</td>
						</tr>
					))}
					</React.Fragment>
				) : <tr><td>Loading...</td></tr>}
			</tbody>
		</table>
	)
}

const Mod = ({ mod, lang, onPreview }) => {
	return (
		<div className="mod" onClick={_=>onPreview(mod)}>
			<img src={mod.image} draggable={false}/>
			<span>{replaceFlags(mod.title[lang])}</span>
		</div>
	)
}

function Counter({ to, duration }) {
	const [value, setValue] = React.useState(0)
	React.useEffect(() => {
		const startTime = performance.now()
		function animate(now) {
			const progress = Math.min((now - startTime) / duration, 1)
			const current = Math.floor(progress * to)
			setValue(current)
			if (progress < 1) { requestAnimationFrame(animate) }
		}
		requestAnimationFrame(animate)
	}, [to, duration])
	return (
		<span>{value}</span>
	)
}
function StatCard({ value, duration, label }) {
	return (
		<div className="stat-card">
			<Counter to={value} duration={duration}/>
			<span>{label}</span>
		</div>
	)
}

function replaceFlags(text) {
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
function share(data) {
	const params = new URLSearchParams()
	params.set("id", data.mod_id)
	const url = new URL(window.location.href)
	url.search = params.toString()
	if (navigator.share) {
		navigator.share({
			title: data.title,
			text: data.title,
			url: url.toString()
		})
	} else {
		navigator.clipboard.writeText(url.toString())
	}
}
function loadStatsPage(SHEET_ID, callback){
	const DOC_ID = "1GEMJfZxjUYmQAg-cDcQ7DGNjsX6pASMp9hQ1T0tVRfo"
	fetch(`https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${SHEET_ID}`)
	.then(r=>{
		if (!r.ok) {
			throw new Error(`HTTP error!: ${r.status}`)
		}
		return r.text()
	}).then(text=>{
		callback(text.split("\n").map(line => line.trim().split(",")))
	})
	.catch(console.error)
}
function statsAsNumber(array){
	return Object.fromEntries(array.map(([key, value]) => [key, Number(value)]))
}
const LANG = {
	"mods_count": {
		"en": "mods",
		"ru": "модов",
		"uk": "модів"
	},
	"author": {
		"en": "Author",
		"ru": "Автор",
		"uk": "Автор"
	},
	"version": {
		"en": "Version",
		"ru": "Версия",
		"uk": "Версія"
	},
	"share": {
		"en": "Share",
		"ru": "Поделиться",
		"uk": "Поділитися"
	},
	"downloads": {
		"en": "Downloads",
		"ru": "Скачиваний",
		"uk": "Завантажень"
	},
	"modsTab": {
		"en": "Mods",
		"ru": "Моды",
		"uk": "Моди"
	},
	"statsTab": {
		"en": "Stats",
		"ru": "Статистика",
		"uk": "Статистика"
	},
	"otherStatsTab": {
		"en": "Other",
		"ru": "Другое",
		"uk": "Інше"
	},
	"installations": {
		"en": "Installations",
		"ru": "Установок",
		"uk": "Встановлень"
	},
	"languagesTable": {
		"en": "Languages",
		"ru": "Языки",
		"uk": "Мови"
	},
	"clientsTable": {
		"en": "Clients",
		"ru": "Клиенты",
		"uk": "Клієнти"
	},
}
