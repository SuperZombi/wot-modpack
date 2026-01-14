const ModsTab = ({
	mods, categories, groups, stats,
	failedToLoadModsInfo, setFailedToLoadModsInfo,
	selectedMods, setSelectedMods,
	cachedMods, selectedClient
}) => {
	const [search, setSearch] = React.useState("")

	const [modPreview, setPreview] = React.useState(null)
	const [displayPreview, setDisplayPreview] = React.useState(false)

	const { language, langData, modsLayout, setModsLayout } = useApp()
	const audioRef = React.useRef(null)
	const [imageLoaded, setImageLoaded] = React.useState(false)

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
	
	React.useEffect(_=>{
		setImageLoaded(false)
	}, [modPreview?.image])

	return (
		<div id="mods-area">
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
								<div className="button hover" style={{display: "flex"}}
									onClick={_=>setModsLayout(prev=>prev=="grid"?"list":"grid")}
								>
									{modsLayout == "grid" ? (
										<img src="images/list.svg" draggable={false} height="20"/>
									) : (
										<img src="images/grid.svg" draggable={false} height="20"/>
									)}
								</div>
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
								cachedMods={cachedMods}
								selectedClient={selectedClient}
							/>
						</div>
						<div id="mod-preview"
							className={`${displayPreview ? "show": ""}`}
							onMouseOver={_=>setDisplayPreview(true)}
							onMouseOut={_=>setDisplayPreview(false)}
						>
							<div className="image-container">
								<img id="mod-image"
									className={`${imageLoaded ? '' : 'loading'}`}
									src={modPreview?.image || ""}
									key={modPreview?.image || ""}
									draggable={false}
									onLoad={_=>setImageLoaded(true)}
								/>
							</div>
							<div id="mod-description-text">
								<h3 align="center" id="mod-title">{modPreview ? replaceFlags(modPreview.title[language]) : ""}</h3>
								<h4 id="mod-subtitle">
									<div id="mod-author">{modPreview?.author}</div>
									<div id="mod-downloads">
										<span>{modPreview && (stats[modPreview.id] || 0)}</span>
										<img src="images/download.svg" height="18" draggable={false}/>
									</div>
								</h4>
								{modPreview?.audio && (
									<audio id="mod-audio"
										src={modPreview.audio || ""}
										ref={audioRef} controls
										controlsList="nodownload"
									/>
								)}
								<div id="mod-description"
									dangerouslySetInnerHTML={{ __html: modPreview?.description?.[language]}}
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
