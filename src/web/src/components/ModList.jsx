function ModList({
	activeCat,
	mods, groups, stats, search,
	selectedMods, setSelectedMods, setPreview, setDisplayPreview,
	cachedMods, selectedClient,
}) {
	const toggleMod = (modId, value=null) => {
		setSelectedMods(prev => {
			const exists = prev.includes(modId)
			if (value === true && !exists) {
				return [...prev, modId]
			}
			if (value === false && exists) {
				return prev.filter(id => id !== modId)
			}
			if (value === null) {
				return exists ? prev.filter(id => id !== modId) : [...prev, modId]
			}
			return prev;
		})
	}
	const { settings } = useApp()

	function matchesSearch(mod, search) {
		if (settings.match_client_lang && mod.lang && mod.lang !== selectedClient.lang.toLocaleLowerCase()) return false
		if (mod.hidden) return false
		if (!search) return true
		const s = search.toLowerCase();
		if (mod.id.toLowerCase().includes(s)) return true;
		if (mod.author && mod.author.toLowerCase().includes(s)) return true;
		if (mod.title && Object.values(mod.title).some(v => v.toLowerCase().includes(s))) return true;
		if (mod.description && Object.values(mod.description).some(v => v.toLowerCase().includes(s))) return true;
		return false;
	}
	function sortByPopularityWithGroups(mods) {
		const groupPopularity = {}
		for (const g of groups) {
			const modsInGroup = mods.filter(m => m.group === g.id)
			if (modsInGroup.length) {
				groupPopularity[g.id] = Math.max(...modsInGroup.map(m => stats[m.id] || 0))
			}
		}
		return [...mods].sort((a, b) => {
			const popA = a.group ? groupPopularity[a.group] : (stats[a.id] || 0)
			const popB = b.group ? groupPopularity[b.group] : (stats[b.id] || 0)
			return popB - popA;
		})
	}
	
	if (!activeCat){ return }

	const filteredMods = search ?
		mods.filter(mod => matchesSearch(mod, search)) :
		mods.filter(mod => matchesSearch(mod, search) && mod.category === activeCat);

	if (search && !filteredMods.length){
		return (
			<div className="flex-center reveal" style={{justifyContent: "center"}}>
				<img src="/images/empty-box.png" height="128" draggable={false} style={{userSelect: "none"}}/>
				<h3><LANG id="nothing_found"/></h3>
			</div>
		)
	}
	
	const allModsSorted = sortByPopularityWithGroups(filteredMods)

	return (
		<div id="mods-list-area">
			{allModsSorted.map(mod => {
				if (mod.group) {
					const group = groups.find(g => g.id === mod.group);
					if (!group) return null;

					const alreadyRendered = allModsSorted.findIndex(m => m.group === group.id) < allModsSorted.indexOf(mod);
					if (alreadyRendered) return null;

					const modsInGroup = allModsSorted.filter(m => m.group === group.id)
					return (
						<Group
							key={group.id}
							id={group.id}
							mods={modsInGroup}
							stats={stats}
							selectedMods={selectedMods}
							toggleMod={toggleMod}
							setPreview={setPreview}
							setDisplayPreview={setDisplayPreview}
							cachedMods={cachedMods}
						/>
					)
				}
				return <Mod
					key={mod.id}
					mod={mod}
					selectedMods={selectedMods}
					cachedMods={cachedMods}
					onChange={() => toggleMod(mod.id)}
					setPreview={setPreview}
					setDisplayPreview={setDisplayPreview}
				/>
			})}
		</div>
	)
}

function Group({
	id, mods, stats,
	selectedMods, toggleMod,
	setPreview, setDisplayPreview,
	cachedMods
}) {
	const sortByPopularity = (arr) => arr.sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0))
	const onModCheck = (mod_id, value) => {
		mods.forEach(mod=>{
			toggleMod(mod.id, false)
		})
		if (value){
			toggleMod(mod_id, value)
		}
	}

	return (
		<React.Fragment>
			{sortByPopularity(mods).map(mod => (
				<Mod
					key={mod.id}
					type="radio"
					name={id}
					mod={mod}
					selectedMods={selectedMods}
					cachedMods={cachedMods}
					onChange={e=>onModCheck(mod.id, e.target.checked)}
					setPreview={setPreview}
					setDisplayPreview={setDisplayPreview}
				/>
			))}
		</React.Fragment>
	)
}

function Mod({
	type="checkbox",
	name="",
	mod,
	onChange,
	setPreview,
	setDisplayPreview,
	selectedMods,
	cachedMods,
}) {
	const {settings, langData} = useApp()
	const [imageLoaded, setImageLoaded] = React.useState(false)

	const onMouse = _=> {
		setPreview(mod)
		setDisplayPreview(true)
	}
	React.useEffect(_=>{
		setImageLoaded(false)
	}, [mod.image])

	const checked = selectedMods.includes(mod.id) || false

	const onGridClick = e=>{
		if (type == "radio" && checked){
			e.preventDefault()
			onChange({
				...e,
				target: {
					...e.target,
					checked: false,
				},
			})
		}
	}
	const cached_ver = (cachedMods.find(el=>el.id==mod.id)||{}).ver || null

	return (
		<label className="mod hover reveal"
			onClick={onGridClick}
			onMouseOver={_=>setPreview(mod)}
			onContextMenu={e=>{e.preventDefault();onMouse()}}
		>
			<input
				className="hover"
				type={type}
				checked={checked}
				onChange={onChange}
				{...(name && { name })}
			/>
			<div className="image-container">
				<img
					src={mod.image}
					key={mod.image}
					className={`${imageLoaded ? '' : 'loading'}`}
					draggable={false}
					loading="lazy"
					onLoad={_=>setImageLoaded(true)}
				/>
			</div>
			<span>{replaceFlags(mod.title[settings.language])}</span>
			{checked && (
				<div className="checkmark">
					<i className="fa-regular fa-check"></i>
				</div>
			)}
		</label>
	)
}
