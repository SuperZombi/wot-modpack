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
		async function get(){
			const version = await eel.app_version()()
			setAppVersion(version)
		}
		get()
	}, [])

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
		async function fetchData() {
			let clientsInfo = await eel.get_clients()()
			setClientsData(clientsInfo)
			setClientsLoaded(true)
		}
		if (page == "home" && !clientsLoaded){
			fetchData()
		}
	}, [page])
	React.useEffect(_=>{
		async function fetchData() {
			let cached = await eel.get_cache_info()()
			setCachedMods(cached)
			setCachedInfoLoaded(true)
		}
		if ((page == "mods" || page == "checkout") && !cachedInfoLoaded){
			fetchData()
		}
	}, [page])

	const resetAllSelected = _=> {
		if (confirm(langData["reset_confirm"])){
			setSelectedMods([])
		}
	}

	const mainCall = async _=> {
		setPage("install")
		let fails = await eel.main_install(selectedClient.path, installArgs, selectedMods)()
		setPage("finish")
		setFailes(fails)
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

			{showSettings ? (
				<Settings
					appVersion={appVersion}
					onClose={_=>setShowSettings(false)}
				/>
			) : null}

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
					/>
				) : null}
			</div>

			<div className="bottom-buttons">
				{(selectedClient && selectedClient.path != "custom") ? (
					page == "home" ? (
						<React.Fragment>
							<div className="button hover">
								<LANG id="delete_mods_button"/>
							</div>
							<div className="button hover" onClick={_=>setPage("mods")}>
								<LANG id="next"/>
							</div>
						</React.Fragment>
					) :
					page == "mods" ? (
						<React.Fragment>
							<div>
								<div className="button hover" onClick={_=>setPage("home")}>
									<LANG id="back"/>
								</div>
								<div className="button hover"
									style={{marginLeft: "10px"}}
									onClick={resetAllSelected}
								>
									<LANG id="reset"/>
								</div>
							</div>
							<div className="button hover" onClick={_=>setPage("checkout")}>
								<LANG id="next"/>
							</div>
						</React.Fragment>
					) :
					page == "checkout" ? (
						<React.Fragment>
							<div>
								<div className="button hover" onClick={_=>setPage("mods")}>
									<LANG id="back"/>
								</div>
							</div>
							<div className="button hover" onClick={mainCall}>
								{selectedMods.length > 0 ? (
									<LANG id="install"/>
								) : (
									<LANG id="delete_mods_button"/>
								)}
							</div>
						</React.Fragment>
					) :
					page == "finish" ? (
						<React.Fragment>
							<div className="button hover"
								onClick={_=>setPage("home")}
								style={{margin: "auto"}}
							>
								<LANG id="home"/>
							</div>
						</React.Fragment>
					) : null
				) : null}
			</div>
		</React.Fragment>
	)
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<AppProvider>
		<App/>
	</AppProvider>
)

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
