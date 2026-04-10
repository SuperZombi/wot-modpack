const InstallLogsViewer = ({
	onVisibilityChange = null
}) => {
	const { langData } = useApp()
	const [logs, setLogs] = React.useState([])
	const [showLogs, setShowLogs] = React.useState(false)
	const [selectedLevel, setSelectedLevel] = React.useState("info")
	const [copied, setCopied] = React.useState(false)

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

	const copyLogs = async _ => {
		const textToCopy = logsText || (langData?.no_logs_for_selected_level || "No logs for selected level.")
		try {
			await navigator.clipboard.writeText(textToCopy)
			setCopied(true)
			setTimeout(()=>setCopied(false), 1200)
		} catch {
			const area = document.createElement("textarea")
			area.value = textToCopy
			document.body.appendChild(area)
			area.select()
			document.execCommand("copy")
			document.body.removeChild(area)
			setCopied(true)
			setTimeout(()=>setCopied(false), 1200)
		}
	}

		return (
				<div className="install-logs-root">
					<Button onClick={toggleLogs} style={{fontSize: "12px", marginTop: "10px"}}>
						{showLogs ? <LANG id="hide_install_logs"/> : <LANG id="show_install_logs"/>}
					</Button>
				{showLogs && (
					<div className="install-logs-area">
						<div className="install-log-controls">
							<label>
								<span><LANG id="log_level"/>:</span>
									<select
										value={selectedLevel}
										onChange={e=>setSelectedLevel(e.target.value)}
								>
									<option value="debug">DEBUG</option>
									<option value="info">INFO</option>
									<option value="warn">WARN</option>
									<option value="error">ERROR</option>
								</select>
						</label>
							<Button onClick={copyLogs} style={{fontSize: "12px", marginLeft: "auto"}}>
								{copied ? <LANG id="copied"/> : <LANG id="copy_logs"/>}
							</Button>
						</div>
							<pre className="install-logs">
								{logsText || <LANG id="no_logs_for_selected_level"/>}
							</pre>
					</div>
				)}
		</div>
	)
}
