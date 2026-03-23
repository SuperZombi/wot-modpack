const ModsList = ({ mods, groups, onPreview, showHidden }) => {
	const [search, setSearch] = React.useState("")
	const normalizedSearch = search.trim().toLowerCase()
	const filteredMods = mods.filter(mod => {
		if (!mod.title && !showHidden) { return false }
		if (!normalizedSearch) { return true }
		if (mod.id.toLowerCase().includes(normalizedSearch)) return true;
		if (mod.author && mod.author.toLowerCase().includes(normalizedSearch)) return true;
		if (mod.title && Object.values(mod.title).some(v => v.toLowerCase().includes(normalizedSearch))) return true;
		if (mod.description && Object.values(mod.description).some(v => v.toLowerCase().includes(normalizedSearch))) return true;
		return false;
	})
	const {lang, langData} = useApp()

	return mods.length > 0 ? (
		<React.Fragment>
			<input
				type="search"
				id="mods-search"
				className="container"
				value={search}
				onChange={e => setSearch(e.target.value)}
				placeholder={langData?.["searchMods"]?.[lang]}
				autoComplete="off"
			/>
			{filteredMods.length > 0 ? (
				<div className="container" id="mods-list">
					{filteredMods.map(mod => {
						if (mod.group) {
							const group = groups.find(g => g.id === mod.group);
							if (!group) return null;

							const alreadyRendered = filteredMods.findIndex(m => m.group === group.id) < filteredMods.indexOf(mod);
							if (alreadyRendered) return null;

							const modsInGroup = filteredMods.filter(m => m.group === group.id)
							return (
								<React.Fragment key={group.id}>
									{modsInGroup.map(gmod=>{
										return (
											<Mod key={gmod.id} mod={gmod} onPreview={onPreview}/>
										)
									})}
								</React.Fragment>
							)
						}
						return (
							<Mod key={mod.id} mod={mod} onPreview={onPreview}/>
						)
					})}
				</div>
			) : (
				<div className="container" style={{paddingBottom: 0}}>
					<Reveal className="line" style={{gap: 0}}>
						<img src="web/images/empty-box.png" alt="No mods found"
							height="128" draggable={false} style={{userSelect: "none"}}
						/>
						<h3>{LANG.nothingFounded[lang]}</h3>
					</Reveal>
				</div>
			)}
		</React.Fragment>
	) : <Loader/>
}
const ModImage = ({ src = "web/images/picture.png" }) => {
	const [loaded, setLoaded] = React.useState(false)
	return (
		<img
			className={loaded ? "" : "img-loading"}
			src={src}
			draggable={false}
			loading="lazy"
			onLoad={() => setLoaded(true)}
		/>
	)
}
const ModLabel = ({mod}) => {
	const {lang} = useApp()
	const hidden = mod.title ? false : true;
	return <span>{hidden ? mod.id : replaceFlags(mod.title[lang])}</span>
}
const Mod = ({ mod, onPreview }) => {
	return (
		<Reveal className="mod" onClick={_=>onPreview(mod)}>
			<ModImage src={mod.image}/>
			<ModLabel mod={mod}/>
		</Reveal>
	)
}
const ModStats = ({mods, onPreview}) => {
	const [stats, setStats] = React.useState({})
	const [statsLoaded, setStatsLoaded] = React.useState(false)
	React.useEffect(() => {
		loadStatsPage("2089462923", data=>{
			setStats(statsAsNumber(data))
			setStatsLoaded(true)
		})
	}, [])

	if (!statsLoaded){
		return <Loader/>
	}

	const sortedMods = mods
		.filter(mod => mod.title)
		.map(mod => ({
			...mod,
			popularity: stats[mod.id] || 0
		}))
		.sort((a, b) => b.popularity - a.popularity)

	return mods.length > 0 ? (
		<div className="container" id="stats-list">
			{sortedMods.map(mod => {
				return (
					<div className="mod" key={mod.id} onClick={_=>onPreview(mod)}>
						<ModImage src={mod.image}/>
						<ModLabel mod={mod}/>
						<span>{mod.popularity}</span>
					</div>
				)
			})}
		</div>
	) : <Loader/>
}
const Loader = ()=>{
	return (
		<div className="container" align="center">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="48" fill="#eee">
				<path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1m0 19a8 8 0 1 1 8-8 8 8 0 0 1-8 8" opacity="0.25"/>
				<path d="M10.14 1.16a11 11 0 0 0-9 8.92A1.6 1.6 0 0 0 2.46 12a1.5 1.5 0 0 0 1.65-1.3 8 8 0 0 1 6.66-6.61A1.4 1.4 0 0 0 12 2.69a1.57 1.57 0 0 0-1.86-1.53">
					<animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
				</path>
			</svg>
		</div>
	)
}
