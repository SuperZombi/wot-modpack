function ModList({
	mods, groups, categories, stats, search, selectedMods, setSelectedMods, setPreview, setDisplayPreview
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

	function matchesSearch(mod, search) {
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
			<div>Ничего не найдено</div>
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
					/>
				)
			})}
		</div>
	)
}

function Category({
	title, icon, mods, groups, stats, search, matchesSearch, selectedMods, toggleMod, setPreview, setDisplayPreview
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

	const filteredMods = mods.filter(mod => matchesSearch(mod, search))
	const allModsSorted = sortByPopularityWithGroups(filteredMods)

	const { language } = useApp()
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
									/>
								)
							}

							return <Mod
								key={mod.id}
								title={mod.title}
								description={mod.description}
								author={mod.author}
								image={mod.image}
								downloads={stats[mod.id] || 0}
								checked={selectedMods.includes(mod.id) || false}
								onChange={() => toggleMod(mod.id)}
								setPreview={setPreview}
								setDisplayPreview={setDisplayPreview}
							/>
						})}
					</div>
				</div>
			</div>

			
		</div>
	)
}

function Group({
	id, title, mods, stats, selectedMods, toggleMod, setPreview, setDisplayPreview
}) {
	const sortByPopularity = (arr) => arr.sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0))
	const [groupChecked, setGroupChecked] = React.useState(mods.some(mod => selectedMods.includes(mod.id)))
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
								downloads={stats[mod.id] || 0}
								onChange={e=>onModCheck(mod.id, e.target.checked)}
								checked={selectedMods.includes(mod.id) || false}
								setPreview={setPreview}
								setDisplayPreview={setDisplayPreview}
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
	downloads,
	checked,
	onChange,
	setPreview,
	setDisplayPreview
}) {
	const { language } = useApp()

	const onMouse = _=> {
		setPreview({
			"title": title[language],
			"description": description ? description[language] : null,
			"author": author,
			"image": image,
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
			<span>{title[language]}</span>
		</label>
	)
}
