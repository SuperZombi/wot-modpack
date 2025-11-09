const ModsTab = () => {
	const [mods, setMods] = React.useState([])
	const [categories, setCategories] = React.useState([])
	const [groups, setGroups] = React.useState([])

	const [stats, setStats] = React.useState({})

	const [search, setSearch] = React.useState("")
	const [selectedMods, setSelectedMods] = React.useState([])

	const [failedToLoadModsInfo, setFailedToLoadModsInfo] = React.useState(false)

	const [modPreview, setPreview] = React.useState(null)
	const [displayPreview, setDisplayPreview] = React.useState(false)

	React.useEffect(() => {
		fetch('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
		.then(r=>{
			if (!r.ok) {
				throw new Error(`HTTP error!: ${r.status}`);
			}
			return r.json()
		}).then(data=>{
			setCategories(data.categories)
			setMods(data.mods)
			setGroups(data.groups)
		})
		.catch(err => {
			console.error(err)
			setFailedToLoadModsInfo(true)
		})
	}, [failedToLoadModsInfo])
	React.useEffect(() => {
		const DOC_ID = "1GEMJfZxjUYmQAg-cDcQ7DGNjsX6pASMp9hQ1T0tVRfo"
    	const SHEET_ID = "2089462923"
		fetch(`https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${SHEET_ID}`)
		.then(r=>{
			if (!r.ok) {
				throw new Error(`HTTP error!: ${r.status}`);
			}
			return r.text()
		}).then(text=>{
			const result = {}
			const lines = text.split("\n")
			for (const line of lines) {
				const item = line.trim().split(",")
				result[item[0]] = parseInt(item[1]);
			}
			setStats(result)
		})
		.catch(err => {
			console.error(err)
		})
	}, [])

	const { langData } = useApp()
	const audioRef = React.useRef(null)

	React.useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		if (!displayPreview) {
			audio.pause()
			audio.currentTime = 0
			return
		}
		const playAudio = () => {
			if (displayPreview) {
				audio.play().catch(() => {})
			}
		}
		if (audio.readyState >= 2) {
			playAudio()
		} else {
			audio.addEventListener('canplay', playAudio, { once: true })
		}
		return () => {
			audio.removeEventListener('canplay', playAudio)
		}
	}, [displayPreview])

	return (
		<div id="mods-area" className="top-content">
			{failedToLoadModsInfo ? (
				<div id="retry_area">
					<LANG id="mods_info_parse_fail"/>
					<div className="button hover" onClick={_=>setFailedToLoadModsInfo(false)}>
						<img src="images/retry.svg" height="18" draggable={false}/>
						<LANG id="retry"/>
					</div>
				</div>
			) : (
				mods.length > 0 ? (
					<React.Fragment>
						<div id="mods-list-area">
							<div id="search-area">
								<input
									className="large"
									type="text"
									placeholder={langData["search"] || "Search"}
									value={search}
									onChange={e => setSearch(e.target.value)}
								/>
							</div>
							<ModList
								mods={mods}
								categories={categories}
								groups={groups}
								stats={stats}
								search={search}
								selectedMods={selectedMods}
								setSelectedMods={setSelectedMods}
								setPreview={setPreview}
								setDisplayPreview={setDisplayPreview}
							/>
						</div>
						<div id="mod-preview" className={`${displayPreview ? "show": ""}`}
							onMouseOver={_=>setDisplayPreview(true)}
							onMouseOut={_=>setDisplayPreview(false)}
						>
							<img id="mod-image"
								src={modPreview?.image || ""}
								key={modPreview?.image || ""}
								draggable={false}
							/>
							<div id="mod-description-text">
								<h3 align="center" id="mod-title">{modPreview ? replaceFlags(modPreview.title) : ""}</h3>
								<h4 id="mod-subtitle">
									<div id="mod-author">{modPreview?.author}</div>
									<div id="mod-downloads">
										<span>{modPreview?.downloads}</span>
										<img src="images/download.svg" height="18" draggable={false}/>
									</div>
								</h4>
								{modPreview?.audio ? (
									<audio id="mod-audio"
										src={modPreview.audio || ""}
										ref={audioRef} controls
										controlsList="nodownload"
									/>
								) : null}
								<div id="mod-description"
									dangerouslySetInnerHTML={{ __html: modPreview?.description}}
								></div>
							</div>
						</div>
					</React.Fragment>
				) : (
					<Loader/>
				)
			)}
		</div>
	)
}
