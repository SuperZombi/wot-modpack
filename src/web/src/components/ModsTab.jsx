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

	const [drag, setDrag] = React.useState(false)

	const onDragEnter = e => {
		e.preventDefault()
		setDrag(true)
	}
	const onDragOver = e => {
		e.preventDefault()
		setDrag(true)
	}
	const onDragLeave = e => {
		e.preventDefault()
		setDrag(false)
	}
	const onDrop = e => {
		e.preventDefault()
		setDrag(false)

		const droppedFile = e.dataTransfer.files[0]
		if (!droppedFile) return

		const reader = new FileReader()
		reader.onload = () => {
			const text = reader.result
			const data = JSON.parse(text)
			const filtered = data.filter(id => 
				mods.some(mod => mod.id === id)
			)
			setSelectedMods(filtered)
		}
		reader.readAsText(droppedFile)
	}

	return (
		<div id="mods-area"
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			{failedToLoadModsInfo ? (
				<div id="retry_area">
					<LANG id="mods_info_parse_fail"/>
					<Button onClick={_=>setFailedToLoadModsInfo(false)}>
						<img src="images/retry.svg" height="18" draggable={false}/>
						<LANG id="retry"/>
					</Button>
				</div>
			) : (
				mods.length > 0 ? (
					<React.Fragment>
						<div id="drag-area" className={drag ? "show":""}></div>
						<div id="mods-list-area">
							<div id="search-area">
								<input
									className="large"
									type="text"
									placeholder={langData["search"] || "Search"}
									value={search}
									onChange={e => setSearch(e.target.value)}
								/>
								<Button style={{display: "flex"}}
									onClick={_=>setModsLayout(prev=>prev=="grid"?"list":"grid")}
								>
									{modsLayout == "grid" ? (
										<img src="images/list.svg" draggable={false} height="20"/>
									) : (
										<img src="images/grid.svg" draggable={false} height="20"/>
									)}
								</Button>
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
