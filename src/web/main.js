function installing_progress(message) {
	const event = new CustomEvent("updateProgress", { detail: message })
	window.dispatchEvent(event)
}
eel.expose(installing_progress)

function on_install_finish(message){
	const event = new CustomEvent("install_finish", { detail: message })
	window.dispatchEvent(event)
}
eel.expose(on_install_finish)
