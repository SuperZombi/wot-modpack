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
	
	const [page, setPage] = React.useState("home")

	React.useEffect(() => {
		if (page == "mods" && mods.length == 0){
			loadModsInfo(data=>{
				setCategories(data.categories)
				setMods(data.mods)
				setGroups(data.groups)
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
	}, [failedToLoadModsInfo, page])
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

	const { langData } = useApp()

	return (
		<React.Fragment>
			<header>
				<a href="https://github.com/SuperZombi/wot-modpack" target="_blank" className="hover" draggable={false}>
					<img src="/images/favicon.png" draggable={false}/>
					<span>Web Modpack</span>
				</a>
				<svg id="setting_button" className="hover" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46">
					<path d="M43.45 18.44h-2.43a18.11 18.11 0 0 0-2.08-4.93l1.75-1.76a2.5 2.5 0 0 0 0-3.54l-2.92-2.92a2.57 2.57 0 0 0-3.55 0L32.4 7.1c-1.5-.87-3.1-1.54-4.87-1.97V2.52A2.5 2.5 0 0 0 25.04 0h-4.13a2.49 2.49 0 0 0-2.47 2.52v2.6a18.72 18.72 0 0 0-4.88 1.98l-1.82-1.8a2.57 2.57 0 0 0-3.55 0L5.27 8.2a2.52 2.52 0 0 0 0 3.54l1.75 1.76a18.11 18.11 0 0 0-2.08 4.93H2.5a2.5 2.5 0 0 0-2.5 2.5v4.12a2.47 2.47 0 0 0 2.5 2.47h2.44a18.2 18.2 0 0 0 2.08 4.94l-1.75 1.77a2.5 2.5 0 0 0 0 3.55l2.92 2.92a2.5 2.5 0 0 0 3.54 0l1.83-1.82c1.5.87 3.12 1.55 4.88 1.98v2.6c0 1.39 1.09 2.5 2.47 2.5h4.13a2.49 2.49 0 0 0 2.49-2.5v-2.6c1.77-.43 3.37-1.1 4.87-1.98l1.81 1.81a2.5 2.5 0 0 0 3.55 0l2.92-2.91a2.5 2.5 0 0 0 0-3.55l-1.75-1.77a18.27 18.27 0 0 0 2.08-4.94h2.44a2.49 2.49 0 0 0 2.52-2.47v-4.13a2.5 2.5 0 0 0-2.52-2.49zM22.98 30.85A7.9 7.9 0 0 1 15.05 23a7.89 7.89 0 0 1 7.93-7.85A7.89 7.89 0 0 1 30.9 23a7.9 7.9 0 0 1-7.93 7.85z"/>
				</svg>
			</header>

			<div className="flex-center top-content">
				{page == "home" ? (
					<HomeTab
						selectedClient={selectedClient}
						setSelectedClient={setSelectedClient}
						clientsData={clientsData}
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
					/>
				) : page == "checkout" ? (
					<CheckoutTab
						selectedClient={selectedClient}
						selectedMods={selectedMods}
						mods={mods}
						setSelectedMods={setSelectedMods}
						cachedMods={cachedMods}
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
							<div className="button hover">
								{selectedMods.length > 0 ? (
									<LANG id="install"/>
								) : (
									<LANG id="delete_mods_button"/>
								)}
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
