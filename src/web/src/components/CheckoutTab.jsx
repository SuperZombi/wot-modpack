const CheckoutTab = ({
	selectedClient, selectedMods, mods, setSelectedMods, cachedMods,
	installArgs, setInstallArgs
}) => {
	const onArgChange = (key, val)=>{
		setInstallArgs(prev => ({
			...prev,
			[key]: val
		}))
	}

	const { language, langData } = useApp()
	return (
		<React.Fragment>
			<div>
				<br/><br/>
				<input type="text" value={selectedClient.path} readOnly={true}
					style={{
						width: `${selectedClient.path.length + 1}ch`,
						maxWidth: "400px"
					}}
				/>
				<br/><br/><br/>
				<div style={{margin: "auto", display: "inline-block"}}>
					<label className="hover">
						<input type="checkbox" className="hover"
							checked={installArgs["save_selected_mods"]}
							onChange={e=>onArgChange("save_selected_mods", e.target.checked)}
						/>
						<LANG id="save_selected_mods"/>
					</label>
					<br/>
					<label className="hover">
						<input type="checkbox" className="hover"
							checked={installArgs["delete_mods"]}
							onChange={e=>onArgChange("delete_mods", e.target.checked)}
						/>
						<LANG id="remove_all_mods"/>
					</label>
					<br/>
					<label className="hover">
						<input type="checkbox" className="hover"
							checked={installArgs["delete_configs"]}
							onChange={e=>onArgChange("delete_configs", e.target.checked)}
						/>
						<LANG id="remove_mod_configs"/>
					</label>
					<br/>
				</div>
			</div>
			<hr style={{width: "90%"}}/>
			{selectedMods.length > 0 ? (
				<React.Fragment>
					<h3><LANG id="selected_mods"/></h3>
					<div className="mods-install-list">
						{selectedMods.map(id=>{
							const modObj = mods.find(mod => mod.id === id)
							const cached_ver = (cachedMods.find(el=>el.id==modObj.id)||{}).ver || null
							return (
								<div className={`mod-item ${(cached_ver && cached_ver == modObj.ver) ? "" : "prior"}`} key={modObj.id}>
									{(cached_ver && cached_ver == modObj.ver) ? (
										<img src="images/check.svg" title={langData["mod_in_cache"]} draggable={false}/>
									) : (
										<img src="images/down-arrow.svg" title={langData["mod_will_be_downloaded"]} draggable={false}/>
									)}
									<span>{replaceFlags(modObj.title[language])}</span>
									<img src="images/close.svg" className="remove hover"
										title={langData["remove"]} draggable={false}
										onClick={_=>setSelectedMods(prev => prev.filter(id => id !== modObj.id))}
									/>
								</div>
							)
						})}
					</div>
				</React.Fragment>
			) : (
				<h3 style={{color: "red"}}><LANG id="mods_will_be_deleted"/></h3>
			)}
		</React.Fragment>
	)
}
