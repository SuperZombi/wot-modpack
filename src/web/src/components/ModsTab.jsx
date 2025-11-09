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

	return (
		<div id="mods-area" className="top-content">
			{failedToLoadModsInfo ? (
				<div id="retry_button" className="button hover" onClick={_=>setFailedToLoadModsInfo(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
						<path d="M463.5 224h8.5c13.3 0 24-10.7 24-24V72a24.03 24.03 0 0 0-41-17l-41.6 41.6c-87.6-86.5-228.7-86.2-315.8 1-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183a24.03 24.03 0 0 0 17 41h119.5z"/>
					</svg>
					<span>Retry</span>
				</div>
			) : (
				mods.length > 0 ? (
					<React.Fragment>
						<div id="mods-list-area">
							<div id="search-area">
								<input
									className="large"
									type="text"
									placeholder="Search"
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
							{/*<div>{JSON.stringify(selectedMods)}</div>*/}
						</div>
						<div id="mod-preview" className={`${displayPreview ? "show": ""}`}
							onMouseOver={_=>setDisplayPreview(true)}
							onMouseOut={_=>setDisplayPreview(false)}
						>
							<img id="mod-image" src={modPreview?.image || ""} draggable={false}/>
							<div id="mod-description-text">
								<h3 align="center" id="mod-title">{modPreview?.title}</h3>
								<h4 id="mod-subtitle">
									<div id="mod-author">{modPreview?.author}</div>
									<div id="mod-downloads">
										<span>{modPreview?.downloads}</span>
										<img src="images/download.svg" height="18" draggable={false}/>
									</div>
								</h4>
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
