const HomeTab = ({
	selectedClient, setSelectedClient, clientsData, setClientsData, clientsLoaded
}) => {
	const { langData, settings, updateSetting } = useApp()

	React.useEffect(_=>{
		if (clientsData.length > 0 && (!selectedClient)){
			setSelectedClient(clientsData[0])
		}
	}, [clientsData, selectedClient])

	React.useEffect(_=>{
		if (selectedClient?.path == "custom"){
			(async _=>{
				let selected_client = await eel.request_custom_client()()
				if (!selected_client){
					setSelectedClient(clientsData[0] || null)
					alert(langData["failed_get_client"])
				} else {
					if (!clientsData.find(c => c.path === selected_client.path)) {
						setClientsData(prev => [...prev, selected_client])
					}
					setSelectedClient(selected_client)
				}
			})()
		}
	}, [selectedClient, clientsData])

	if (!clientsLoaded){
		return <Loader/>
	}

	const options = [
		...clientsData,
		{ path: "custom", title: langData["custom_game_folder"] }
	]
	return (
		<React.Fragment>
			{ !settings.data_collection && <DataCollectionPopup onClose={_=>{updateSetting("data_collection", true)}}/>}
			<div>
				<br/>
				<h3><LANG id="select_game_folder"/></h3>
				<div>
					<Select
						options={options}
						value={selectedClient}
						onChange={setSelectedClient}
						placeholder={langData["custom_game_folder"]}
						display_hint={true}
					/>
				</div>
			</div>
			<Gallery/>
		</React.Fragment>
	)
}

const SelectOption = ({val, hint=false, children, className, onClick}) => {
	return (
		<Button className={className} onClick={onClick}
			tooltip={(hint && val.path != "custom") ? val.path : null}
		>
			{
				val.type == "steam" ? (
					<div className="icon blue">
						<i className="fa-brands fa-steam-symbol"></i>
					</div>
				) : val.type == "wg" ? (
					<div className="icon yellow">
						<i className="fa-solid fa-gamepad-modern"></i>
					</div>
				) : val.path == "custom" ? (
					<div className="icon">
						<i className="fa-solid fa-folder-open"></i>
					</div>
				) : null
			}
			<div className="select-item-area">
				<div className={`select-title ${val.type == "steam" ? "blue" : val.type == "wg" ? "yellow" : ""}`}>
					<span>{val ? val.title : placeholder}</span>
					{(val.branch && val.branch !== "release") && <span className="tag">test</span>}
				</div>
				{
					(hint && val && val.path != "custom") && (
						<div className="selected-value">
							{val.path}
						</div>
					)
				}
			</div>
			{children}
		</Button>
	)
}
function Select({ options=[], value, onChange, placeholder="", display_hint=false, style={} }) {
	const [open, setOpen] = React.useState(false)
	const ref = React.useRef(null)

	React.useEffect(() => {
		function handleClickOutside(e) {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false)
			}
		}
		document.addEventListener("click", handleClickOutside)
		return () => document.removeEventListener("click", handleClickOutside)
	}, [])

	const handleSelect = (option) => {
		onChange(option)
		setOpen(false)
	}

	return (
		<div ref={ref} className="select" style={style}>
			<SelectOption
				val={value}
				className="select-header tooltip-bottom"
				hint={display_hint}
				onClick={() => setOpen(!open)}
			>
				<div className={`arrow ${open ? "open" : ""}`}>
					<i className="fa-solid fa-angle-down"></i>
				</div>
			</SelectOption>
			{open && (
				<div className="select-options">
					{options.map((option) => (
						<SelectOption
							key={option.path}
							val={option}
							className={(value?.path == option.path) ? "selected": ""}
							hint={display_hint}
							onClick={() => handleSelect(option)}
						>
							{(value?.path == option.path) && (
								<div className="arrow" style={{fontSize: "0.75em", marginRight: "0.25em"}}>
									<i className="fa-solid fa-check"></i>
								</div>
							)}
						</SelectOption>
					))}
				</div>
			)}
		</div>
	)
}
