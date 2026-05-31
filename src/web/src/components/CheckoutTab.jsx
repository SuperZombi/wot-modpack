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
	React.useEffect(_=>{
		if (selectedMods.length == 0){
			onArgChange("delete_mods", true)
		}
	}, [selectedMods, installArgs.delete_mods])

	const onClearInstall = _=>{
		onArgChange("delete_mods", true)
		onArgChange("delete_configs", true)
	}
	const onUpdateInstall = _=>{
		onArgChange("delete_mods", true)
		onArgChange("delete_configs", false)
	}
	const { settings, updateSetting, langData } = useApp()
	const [needToShowTooltip, setNeedToShowTooltip] = React.useState(settings.first_install)
	const tooltipOnClick = () => {
		setNeedToShowTooltip(false)
		updateSetting("first_install", false)
	}
	const layoutButtonStyle = {
		boxShadow: (needToShowTooltip && settings.first_install) ? "0 0 12px orange" : null
	}
	return (
		<React.Fragment>
			<div>
				<br/><br/>
				<input type="text" value={selectedClient.path} readOnly={true}
					style={{
						width: `${selectedClient.path.length + 2}ch`,
						maxWidth: "400px",
						fontFamily: "monospace",
						fontSize: "1rem"
					}}
				/>
				<br/><br/>
				<div className="flex-center-row" style={{fontSize: "0.85rem"}}
					onClick={(needToShowTooltip && settings.first_install)?tooltipOnClick:null}
				>
					<div className="tooltip-show" tooltip={
						(needToShowTooltip && settings.first_install)?langData["first_install_tooltip"]:null
					}>
						<Button onClick={onClearInstall} style={layoutButtonStyle}>
							<i className="fa-regular fa-layer-group"></i>
							<LANG id="clear_install_button"/>
						</Button>
					</div>
					<Button onClick={onUpdateInstall}>
						<i className="fa-regular fa-circle-up"></i>
						<LANG id="update_install_button"/>
					</Button>
				</div>
				<br/>
				<div style={{margin: "auto", display: "inline-block"}}>
					<label className="hover">
						<input type="checkbox" className="hover"
							checked={installArgs["save_selected_mods"]}
							onChange={e=>onArgChange("save_selected_mods", e.target.checked)}
						/>
						<i className="fa-solid fa-bookmark"></i>
						<LANG id="save_selected_mods"/>
					</label>
					<br/>
					<label className="hover">
						<input type="checkbox" className="hover"
							checked={installArgs["delete_mods"]}
							onChange={e=>onArgChange("delete_mods", e.target.checked)}
						/>
						<i className="fa-solid fa-trash-can"></i>
						<LANG id="remove_all_mods"/>
					</label>
					<br/>
					<label className="hover">
						<input type="checkbox" className="hover"
							checked={installArgs["delete_configs"]}
							onChange={e=>onArgChange("delete_configs", e.target.checked)}
						/>
						<i className="fa-regular fa-file-slash"></i>
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
										<div tooltip={langData["mod_in_cache"]} className="help">
											<i className="fa-solid fa-circle-check" style={{color: "#00c500"}}></i>
										</div>
									) : (
										<div tooltip={langData["mod_will_be_downloaded"]} className="help">
											<i className="fa-solid fa-circle-down" style={{color: "#ffa500"}}></i>
										</div>
									)}
									<span>{replaceFlags(modObj.title[settings.language])}</span>
									<div tooltip={langData["remove"]} className="remove hover"
										onClick={_=>setSelectedMods(prev => prev.filter(id => id !== modObj.id))}
									>
										<i className="fa-regular fa-circle-xmark" style={{color: "red"}}></i>
									</div>
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
