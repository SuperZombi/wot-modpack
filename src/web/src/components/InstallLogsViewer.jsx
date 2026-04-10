const InstallLogsViewer = ({
	onVisibilityChange = null
}) => {
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
		const textToCopy = logsText || "No logs for selected level."
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
			<Button onClick={toggleLogs} style={{fontSize: "12px"}}>
				{showLogs ? "Hide install logs" : "Show install logs"}
			</Button>
			{showLogs && (
				<div className="install-logs-area">
					<div className="install-log-controls">
						<label>
							<span>Log level:</span>
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
						<Button onClick={copyLogs} style={{fontSize: "12px"}}>
							{copied ? "Copied" : "Copy logs"}
						</Button>
					</div>
					<pre className="install-logs">
						{logsText || "No logs for selected level."}
					</pre>
				</div>
			)}
		</div>
	)
}
