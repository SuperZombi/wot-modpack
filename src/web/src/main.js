function installing_progress(message) {
	const event = new CustomEvent("updateProgress", { detail: message })
	window.dispatchEvent(event)
}
eel.expose(installing_progress)
