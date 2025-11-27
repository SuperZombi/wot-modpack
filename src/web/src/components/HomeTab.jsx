const HomeTab = ({
	selectedClient, setSelectedClient, clientsData, setClientsData, clientsLoaded
}) => {
	const { langData } = useApp()

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
			<div>
				<br/>
				<h3><LANG id="select_game_folder"/></h3>
				<div>
					<Select
						options={options}
						value={selectedClient}
						onChange={setSelectedClient}
						placeholder={langData["custom_game_folder"]}
					/>
				</div>
			</div>
			<Gallery/>
		</React.Fragment>
	)
}

function Select({ options=[], value, onChange, placeholder="" }) {
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
		<div ref={ref} className="select">
			<div
				className="select-header button hover"
				onClick={() => setOpen(!open)}
				title={value ? value.path : null}
			>
				{value ? value.title : placeholder}
			</div>
			{open && (
				<div className="select-options">
					{options.map((option) => (
						<div
							key={option.path}
							title={option.path != "custom" ? option.path : null}
							className={`button hover ${value?.path == option.path ? "selected": ""}`}
							onClick={() => handleSelect(option)}
						>
							{option.title}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
