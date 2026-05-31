const InstallLogsViewer = ({
	onVisibilityChange = null
}) => {
	const { langData } = useApp()
	const [logs, setLogs] = React.useState([])
	const [showLogs, setShowLogs] = React.useState(false)
	const [selectedLevel, setSelectedLevel] = React.useState("info")

	const levelsOrder = ["debug", "info", "warn", "error"]
	const selectedIndex = levelsOrder.indexOf(selectedLevel)
	const visibleLevels = levelsOrder.slice(selectedIndex)
	const visibleLogs = logs.filter(log => visibleLevels.includes(log.level))
	const logsText = visibleLogs.map(log => `[${log.level.toUpperCase()}] ${log.message}`).join("\n")

	const toggleLogs = async _ => {
		if (!showLogs && logs.length === 0){
			const installLogs = await eel.get_install_logs()()
			setLogs(installLogs || [])
		}
		setShowLogs(prev => !prev)
	}

	React.useEffect(() => {
		if (typeof onVisibilityChange === "function"){
			onVisibilityChange(showLogs)
		}
	}, [showLogs])

	const levelOptions = [
		{ path: "debug", title: "DEBUG" },
		{ path: "info", title: "INFO" },
		{ path: "warn", title: "WARN" },
		{ path: "error", title: "ERROR" }
	]

	const copyLogs = async _ => {
		try {
			await navigator.clipboard.writeText(logsText)
		} catch {
			const area = document.createElement("textarea")
			area.value = logsText
			document.body.appendChild(area)
			area.select()
			document.execCommand("copy")
			document.body.removeChild(area)
		}
	}

	return (
		<div className="install-logs-root">
			<Button onClick={toggleLogs} style={{fontSize: "14px"}}>
				<i className="fa-solid fa-list"></i>
				{showLogs ? <LANG id="hide_install_logs"/> : <LANG id="show_install_logs"/>}
			</Button>
		{showLogs && (
			<div className="install-logs-area">
				<div className="install-log-controls">
					<label>
						<span><LANG id="log_level"/>:</span>
						<Select
							options={levelOptions}
							value={{path: selectedLevel, title: levelOptions.find(x=>x.path==selectedLevel).title}}
							onChange={val=>setSelectedLevel(val.path)}
						/>
					</label>
					<div className="actions">
						<Button
							onClick={copyLogs}
							tooltip={langData["copy_logs"]}
						>
							<i className="fa-regular fa-copy"></i>
						</Button>
						<Button
							tooltip={langData["save_logs_to_file"]}
							onClick={_=>writeToFile(logsText, `logs_${selectedLevel}.txt`)}
						>
							<i className="fa-solid fa-down"></i>
						</Button>
					</div>
				</div>
				<pre className="install-logs">
					{logsText || <LANG id="no_logs_for_selected_level"/>}
				</pre>
			</div>
		)}
		</div>
	)
}
