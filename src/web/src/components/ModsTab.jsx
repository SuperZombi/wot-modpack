const ModsTab = ({
	mods, categories, groups, stats,
	failedToLoadModsInfo, setFailedToLoadModsInfo,
	selectedMods, setSelectedMods,
	cachedMods, selectedClient
}) => {
	const [search, setSearch] = React.useState("")

	const [modPreview, setPreview] = React.useState(null)
	const [displayPreview, setDisplayPreview] = React.useState(false)

	const {langData, settings, updateSetting} = useApp()
	const audioRef = React.useRef(null)
	const [imageLoaded, setImageLoaded] = React.useState(false)

	const [activeCat, setActiveCat] = React.useState()

	// const [forceOpenCategories, setForceOpenCategories] = React.useState(false)
	// const [needToShowTooltip, setNeedToShowTooltip] = React.useState(settings.layout_tooltip)
	// const tooltipOnClick = () => {
	// 	setNeedToShowTooltip(false)
	// 	updateSetting("layout_tooltip", false)
	// 	setForceOpenCategories(true)
	// }

	React.useEffect(() => {
		setActiveCat(categories[0]?.name)
	}, [categories])

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

	// const layoutButtonStyle = {
	// 	display: "flex",
	// 	boxShadow: (needToShowTooltip && settings.layout == "list") ? "0 0 10px orange" : null
	// }

	return (
		<React.Fragment>
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
					<div id="mods-area"
						onDragEnter={onDragEnter}
						onDragLeave={onDragLeave}
						onDragOver={onDragOver}
						onDrop={onDrop}
					>
						<div id="drag-area" className={drag ? "show":""}></div>

						<SideBar
							mini={displayPreview}
							setDisplayPreview={setDisplayPreview}
							activeCat={activeCat}
							setActiveCat={setActiveCat}
							mods={mods}
							categories={categories}
							search={search}
							setSearch={setSearch}
						/>
						
						<ModList
							activeCat={activeCat}
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
						{displayPreview && (
							<div id="mod-preview" className="container">
								<div className="close hover" onClick={_=>setDisplayPreview(false)}>
									<i data-lucide="circle-x"></i>
								</div>
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
									<h3 align="center" id="mod-title">{modPreview ? replaceFlags(modPreview.title[settings.language]) : ""}</h3>
									<h4 id="mod-subtitle">
										<div className="mod-header-item">
											<div style={{display: !modPreview?.author ? "none" : ""}}>
												<i data-lucide="user-round"></i>
											</div>
											<div id="mod-author">{modPreview?.author}</div>
										</div>
										<div className="mod-header-item">
											<span>{modPreview && (stats[modPreview.id] || 0)}</span>
											<div><i data-lucide="download"></i></div>
										</div>
									</h4>
									{modPreview?.audio && (
										<audio id="mod-audio"
											src={modPreview.audio || ""}
											ref={audioRef} controls autoPlay
											controlsList="nodownload"
										/>
									)}
									<div id="mod-description"
										dangerouslySetInnerHTML={{ __html: modPreview?.description?.[settings.language]}}
									></div>
								</div>
							</div>
						)}
					</div>
				) : (
					<Loader/>
				)
			)}
		</React.Fragment>
	)
}
const SideBar = ({
	mini,
	activeCat,
	setActiveCat,
	mods,
	categories,
	search,
	setSearch,
	setDisplayPreview
}) => {
	React.useEffect(() => {
		lucide.createIcons()
	}, [])
	const {langData, settings} = useApp()
	return (
		<div id="mods-sidebar" className="container">
			{!mini && (
				<div id="search-area">
					<input
						className="large"
						type="search"
						placeholder={langData["search"]}
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>
			)}

			{categories.map(cat=>(
				<div className={`cat-item hover ${activeCat == cat.name ? "active" : ""}`}
					key={cat.name} onClick={_=>{
						setActiveCat(cat.name)
						setSearch("")
						setDisplayPreview(false)
					}}
				>
					<i data-lucide={cat.icon}></i>
					{!mini && (
						<React.Fragment>
							<span>{cat.title[settings.language]}</span>
							<span className="cnt">{mods.filter(m=>m.category == cat.name).length}</span>
						</React.Fragment>
					)}
				</div>
			))}
		</div>
	)
}
