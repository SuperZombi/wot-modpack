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
						display_hint={true}
					/>
				</div>
			</div>
			<Gallery/>
		</React.Fragment>
	)
}

function Select({ options=[], value, onChange, placeholder="", display_hint=false }) {
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
			<Button className="select-header"
				onClick={() => setOpen(!open)}
				title={(display_hint && value) ? value.path : null}
			>
				{value ? value.title : placeholder}
			</Button>
			{open && (
				<div className="select-options">
					{options.map((option) => (
						<Button key={option.path}
							title={(display_hint && option.path != "custom") ? option.path : null}
							className={(value?.path == option.path) ? "selected": ""}
							onClick={() => handleSelect(option)}
						>
							{option.title}
						</Button>
					))}
				</div>
			)}
		</div>
	)
}
const Button = ({children, href=null, className="", ...props})=>{
	if (href){
		return (
			<a className={`button hover ${className}`.trim()}
				href={href} target="_blank" {...props}
			>
				{children}
			</a>
		)
	}
	return (
		<div className={`button hover ${className}`.trim()}
			{...props}
		>
			{children}
		</div>
	)
}
const BackButton = ({className="", style, ...props})=>{
	return (
		<Button
			className={`flex-center-row ${className}`}
			style={{ display: "inline-flex", gap: "5px", ...style }}
			{...props}
		>
			<img src="images/back.svg" height="18" draggable={false}/>
			<LANG id="back"/>
		</Button>
	)
}
const NextButton = ({className="", style, ...props})=>{
	return (
		<Button
			className={`flex-center-row ${className}`}
			style={{ display: "inline-flex", gap: "5px", ...style }}
			{...props}
		>
			<LANG id="next"/>
			<img src="images/next.svg" height="18" draggable={false}/>
		</Button>
	)
}
