const CheckoutTab = ({
	selectedClient, selectedMods, mods, setSelectedMods
}) => {
	const { language, langData } = useApp()
	return (
		<React.Fragment>
			<div>
				<br/><br/>
				<input type="text" value={selectedClient.path} readOnly={true} style={{width: "100%"}}/>
				<br/><br/><br/>
				<label className="hover">
					<input type="checkbox" className="hover"/>
					<LANG id="save_selected_mods"/>
				</label>
				<br/>
				<label className="hover">
					<input type="checkbox" className="hover"/>
					<LANG id="remove_all_mods"/>
				</label>
				<br/>
				<label className="hover">
					<input type="checkbox" className="hover"/>
					<LANG id="remove_mod_configs"/>
				</label>
				<br/>
			</div>
			<hr style={{width: "90%"}}/>
			{selectedMods.length > 0 ? (
				<React.Fragment>
					<h3><LANG id="selected_mods"/></h3>
					<div className="mods-install-list">
						{selectedMods.map(id=>{
							const modObj = mods.find(mod => mod.id === id);
							return (
								<div className="mod-item" key={modObj.id}>
									<img src="images/check.svg" title={langData["mod_in_cache"]} draggable={false}/>
									<span>{modObj.title[language]}</span>
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
