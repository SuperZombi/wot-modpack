const Loader = () => {
	return (
		<div id="loader" className="shade flex-center">
			<div className="loader" style={{height: "120px", width: "120px"}}></div>
		</div>
	)
}
const App = () => {
	const [mods, setMods] = React.useState([])
	const [categories, setCategories] = React.useState([])
	const [groups, setGroups] = React.useState([])
	const [stats, setStats] = React.useState({})

	const [failedToLoadModsInfo, setFailedToLoadModsInfo] = React.useState(false)

	const [selectedMods, setSelectedMods] = React.useState([])
	const [selectedClient, setSelectedClient] = React.useState(null)

	const [clientsData, setClientsData] = React.useState([])
	const [clientsLoaded, setClientsLoaded] = React.useState(false)

	const [cachedMods, setCachedMods] = React.useState([])
	const [cachedInfoLoaded, setCachedInfoLoaded] = React.useState(false)

	const [updateAvailable, setUpdateAvailable] = React.useState(false)

	const [installArgs, setInstallArgs] = React.useState({
		"save_selected_mods": true,
		"delete_mods": true,
		"delete_configs": false
	})

	const [currentInstall, setCurrentInstall] = React.useState({})
	const [fails, setFailes] = React.useState([])
	
	const [page, setPage] = React.useState("home")
	const [showSettings, setShowSettings] = React.useState(false)
	const [appVersion, setAppVersion] = React.useState(0)

	React.useEffect(() => {
		(async _=>{
			const version = await eel.app_version()()
			setAppVersion(version)
		})()
	}, [])
	React.useEffect(() => {
		if (page == "mods" && mods.length > 0 && selectedMods.length == 0){
			(async _=>{
				const settings = await eel.get_settings()()
				if (settings.mods){
					setSelectedMods(
						settings.mods.filter(id => 
							mods.some(mod => mod.id === id)
						)
					)
				}
			})()
		}
	}, [mods, page])

	React.useEffect(() => {
		if (page == "mods" && mods.length == 0){
			loadModsInfo(async data=>{
				setCategories(data.categories)
				setMods(data.mods)
				setGroups(data.groups)
				await eel.set_mods_data(data.mods)()
			}, err=>{
				console.error(err)
				setFailedToLoadModsInfo(true)
			})
		}
	}, [failedToLoadModsInfo, page])
	React.useEffect(() => {
		if (page == "mods" && Object.keys(stats).length == 0){
			loadModsStats(setStats, console.error)
		}
	}, [page])
	React.useEffect(_=>{
		if (page == "home" && !clientsLoaded){
			(async _=>{
				const clientsInfo = await eel.get_clients()()
				setClientsData(clientsInfo)
				const settings = await eel.get_settings()()
				if (settings.client){
					const client_info = await eel.get_client_info_by_path(settings.client)()
					if (client_info){
						const exists = clientsInfo.some(c => c.path === client_info.path);
						if (!exists) {
							setClientsData(prev => [
								...prev, ...client_info
							])
						}
						setSelectedClient(client_info)
					}
				}
				setClientsLoaded(true)
			})()
		}
	}, [page])
	React.useEffect(_=>{
		if ((page == "mods" || page == "checkout") && !cachedInfoLoaded){
			(async _=> {
				let cached = await eel.get_cache_info()()
				setCachedMods(cached)
				setCachedInfoLoaded(true)
			})()
		}
	}, [page])

	const resetAllSelected = _=> {
		if (confirm(langData["reset_confirm"])){
			setSelectedMods([])
		}
	}

	const mainCall = _=> {
		setPage("install")
		eel.main_install(selectedClient.path, installArgs, selectedMods)()
	}
	React.useEffect(() => {
		const handler = (e) => {
			setCurrentInstall(prev => ({
				...prev, ...e.detail
			}))
		}
		window.addEventListener("updateProgress", handler)
		return () => window.removeEventListener("updateProgress", handler)
	}, [])
	React.useEffect(() => {
		const handler = (e) => {
			setPage("finish")
			setFailes(e.detail)
			setCachedInfoLoaded(false)
			setCurrentInstall({})
		}
		window.addEventListener("install_finish", handler)
		return () => window.removeEventListener("install_finish", handler)
	}, [])
	React.useEffect(() => {
		(async _=>{
			const res = await eel.check_updates()()
			setUpdateAvailable(res)
		})()
	}, [])

	const onModsDelete = _=> {
		setSelectedMods([])
		setPage("checkout")
	}

	const { langData } = useApp()

	return (
		<React.Fragment>
			<header>
				<a href="https://github.com/SuperZombi/wot-modpack" target="_blank" className="hover" draggable={false}>
					<img src="/images/favicon.png" draggable={false}/>
					<span>Web Modpack</span>
				</a>
				<img id="setting_button" className="hover"
					src="/images/settings.svg" draggable={false}
					onClick={_=>setShowSettings(true)}
				/>
			</header>

			{showSettings && (
				<Settings
					appVersion={appVersion}
					onClose={_=>setShowSettings(false)}
					setCachedMods={setCachedMods}
				/>
			)}

			{ updateAvailable && <UpdatePopup onClose={_=>setUpdateAvailable(false)}/>}

			<div className="flex-center top-content">
				{page == "home" ? (
					<HomeTab
						selectedClient={selectedClient}
						setSelectedClient={setSelectedClient}
						clientsData={clientsData}
						setClientsData={setClientsData}
						clientsLoaded={clientsLoaded}
					/>
				) : page == "mods" ? (
					<ModsTab
						mods={mods}
						categories={categories}
						groups={groups}
						stats={stats}
						failedToLoadModsInfo={failedToLoadModsInfo}
						setFailedToLoadModsInfo={setFailedToLoadModsInfo}
						selectedMods={selectedMods}
						setSelectedMods={setSelectedMods}
						cachedMods={cachedMods}
						selectedClient={selectedClient}
					/>
				) : page == "checkout" ? (
					<CheckoutTab
						selectedClient={selectedClient}
						selectedMods={selectedMods}
						mods={mods}
						setSelectedMods={setSelectedMods}
						cachedMods={cachedMods}
						installArgs={installArgs}
						setInstallArgs={setInstallArgs}
					/>
				) : page == "install" ? (
					<InstallTab
						mods={mods}
						currentInstall={currentInstall}
					/>
				) : page == "finish" ? (
					<FinishTab
						fails={fails}
						mods={mods}
						selectedMods={selectedMods}
					/>
				) : null}
			</div>

			<div className="bottom-buttons">
				{(selectedClient && selectedClient.path != "custom") && (
					page == "home" ? (
						<React.Fragment>
							<Button onClick={onModsDelete}>
								<LANG id="delete_mods_button"/>
							</Button>
							<NextButton onClick={_=>setPage("mods")}/>
						</React.Fragment>
					) :
					page == "mods" ? (
						<React.Fragment>
							<div style={{display: "flex", gap: "0.5em"}}>
								<BackButton onClick={_=>setPage("home")}/>
								{mods.length > 0 && (
									<Button onClick={resetAllSelected}>
										<LANG id="reset"/>
									</Button>
								)}
							</div>
							<NextButton onClick={_=>setPage("checkout")}/>
						</React.Fragment>
					) :
					page == "checkout" ? (
						<React.Fragment>
							<BackButton onClick={_=>setPage("mods")}/>
							{selectedMods.length > 0 && (
								<Button className="flex-center-row" style={{display: "flex"}}
									onClick={_=>writeToFile(JSON.stringify(selectedMods, null, 4), "my-mods.json")}
								>
									<img src="images/share.svg" height="18" draggable={false}/>
									<LANG id="share"/>
								</Button>
							)}
							<Button onClick={mainCall}>
								{selectedMods.length > 0 ? (
									<LANG id="install"/>
								) : (
									<LANG id="delete_mods_button"/>
								)}
							</Button>
						</React.Fragment>
					) :
					page == "finish" ? (
						<Button onClick={_=>setPage("home")}
							style={{margin: "auto"}}
						>
							<LANG id="home"/>
						</Button>
					) : null
				)}
			</div>
		</React.Fragment>
	)
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<AppProvider>
		<App/>
	</AppProvider>
)

function writeToFile(data, filename){
	const blob = new Blob([data])
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url;
	a.download = filename;
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

function loadModsInfo(callback, error){
	fetch('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
	.then(r=>{
		if (!r.ok) {
			throw new Error(`HTTP error!: ${r.status}`);
		}
		return r.json()
	}).then(callback)
	.catch(error)
}
function loadModsStats(callback, error){
	const DOC_ID = "1GEMJfZxjUYmQAg-cDcQ7DGNjsX6pASMp9hQ1T0tVRfo"
	const SHEET_ID = "2089462923"
	fetch(`https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${SHEET_ID}`)
	.then(r=>{
		if (!r.ok) {
			throw new Error(`HTTP error!: ${r.status}`);
		}
		return r.text()
	}).then(text=>{
		const result = {}
		const lines = text.split("\n")
		for (const line of lines) {
			const item = line.trim().split(",")
			result[item[0]] = parseInt(item[1]);
		}
		callback(result)
	})
	.catch(error)
}
