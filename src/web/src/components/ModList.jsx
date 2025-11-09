function ModList({
	mods, groups, categories, stats, search,
	selectedMods, setSelectedMods, setPreview, setDisplayPreview,
	cachedMods, selectedClient
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
	const { matchClientLang } = useApp()

	function matchesSearch(mod, search) {
		if (matchClientLang && mod.lang && mod.lang !== selectedClient.lang.toLocaleLowerCase()) return false

		if (!search) return true;
		const s = search.toLowerCase();
		if (mod.id.toLowerCase().includes(s)) return true;
		if (mod.author && mod.author.toLowerCase().includes(s)) return true;
		if (mod.title && Object.values(mod.title).some(v => v.toLowerCase().includes(s))) return true;
		if (mod.description && Object.values(mod.description).some(v => v.toLowerCase().includes(s))) return true;
		return false;
	}
	const anyMatch = categories.some(cat => {
		const catMods = mods.filter(m => m.category === cat.name)
		return catMods.some(mod => matchesSearch(mod, search))
	})

	if (search && !anyMatch){
		return (
			<h3 align="center">
				<LANG id="nothing_found"/>
			</h3>
		)
	}

	return (
		<div id="mods-list">
			{categories.map(cat => {
				const catMods = mods.filter(m => m.category === cat.name)

				return (
					<Category
						key={cat.name}
						title={cat.title}
						icon={cat.image}
						mods={catMods}
						groups={groups}
						stats={stats}
						search={search}
						matchesSearch={matchesSearch}
						selectedMods={selectedMods}
						toggleMod={toggleMod}
						setPreview={setPreview}
						setDisplayPreview={setDisplayPreview}
						cachedMods={cachedMods}
					/>
				)
			})}
		</div>
	)
}

function Category({
	title, icon, mods, groups, stats,
	search, matchesSearch,
	selectedMods, toggleMod,
	setPreview, setDisplayPreview,
	cachedMods
}) {
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
	const { language } = useApp()
	const filteredMods = mods.filter(mod => matchesSearch(mod, search))
	const allModsSorted = sortByPopularityWithGroups(filteredMods)
	const [opened, setOpened] = React.useState(false)
	React.useEffect(_=>{
		setOpened(search.length > 0)
	}, [search])

	if (!filteredMods.length) return null;

	return (
		<div className="details category">
			<label className="summary hover">
				<input type="checkbox" checked={opened} onChange={e=>setOpened(e.target.checked)}/>
				{icon ? <img src={icon} draggable={false}/> : null}
				<span>{title[language]}</span>
			</label>
				
			<div className="collapse">
				<div className="wrapper">
					<div className="content">
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
										title={group.title}
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
								title={mod.title}
								description={mod.description}
								author={mod.author}
								image={mod.image}
								audio={mod.audio}
								downloads={stats[mod.id] || 0}
								checked={selectedMods.includes(mod.id) || false}
								onChange={() => toggleMod(mod.id)}
								setPreview={setPreview}
								setDisplayPreview={setDisplayPreview}
								version={mod.ver}
								cached_ver={
									(cachedMods.find(el=>el.id==mod.id)||{}).ver || null
								}
							/>
						})}
					</div>
				</div>
			</div>

			
		</div>
	)
}

function Group({
	id, title, mods, stats,
	selectedMods, toggleMod,
	setPreview, setDisplayPreview,
	cachedMods
}) {
	const sortByPopularity = (arr) => arr.sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0))
	const [groupChecked, setGroupChecked] = React.useState(false)
	const onGroupCheck = e => {
		const value = e.target.checked
		setGroupChecked(value)
		if (!value){
			mods.forEach(mod=>{
				toggleMod(mod.id, false)
			})
		} else {
			toggleMod(mods[0].id, true)
		}
	}
	const onModCheck = (mod_id, value) => {
		setGroupChecked(value)
		mods.forEach(mod=>{
			toggleMod(mod.id, false)
		})
		if (value){
			toggleMod(mod_id, value)
		}
	}
	React.useEffect(_=>{
		setGroupChecked(mods.some(mod => selectedMods.includes(mod.id)))
	}, [selectedMods])

	const { language } = useApp()
	return (
		<div className="details group">
			<label className="summary hover">
				<input
					type="checkbox"
					checked={groupChecked}
					onChange={onGroupCheck}
				/>
				<span>{title[language]}</span>
			</label>
			<div className="collapse">
				<div className="wrapper">
					<div className="content">
						{sortByPopularity(mods).map(mod => (
							<Mod
								key={mod.id}
								type="radio"
								name={id}
								title={mod.title}
								description={mod.description}
								author={mod.author}
								image={mod.image}
								audio={mod.audio}
								downloads={stats[mod.id] || 0}
								onChange={e=>onModCheck(mod.id, e.target.checked)}
								checked={selectedMods.includes(mod.id) || false}
								setPreview={setPreview}
								setDisplayPreview={setDisplayPreview}
								version={mod.ver}
								cached_ver={
									(cachedMods.find(el=>el.id==mod.id)||{}).ver || null
								}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

function Mod({
	type="checkbox",
	name="",
	title,
	description,
	author,
	image,
	audio,
	downloads,
	checked,
	onChange,
	setPreview,
	setDisplayPreview,
	version,
	cached_ver
}) {
	const { language, langData } = useApp()

	const onMouse = _=> {
		setPreview({
			"title": title[language],
			"description": description ? description[language] : null,
			"author": author,
			"image": image,
			"audio": audio,
			"downloads": downloads
		})
		setDisplayPreview(true)
	}

	return (
		<label className="mod hover" onMouseOver={onMouse} onMouseOut={_=>setDisplayPreview(false)}>
			<input
				className="hover"
				type={type}
				checked={checked}
				onChange={onChange}
				{...(name && { name })}
			/>
			<span>{replaceFlags(title[language])}</span>
			{
				(cached_ver && cached_ver != version) ? (
					<span className="new-badge" title={langData["mod_updated"]}/>
				) : null
			}
		</label>
	)
}
