const Popup = ({onClose, children}) => {
	return (
		<div className="popup show" onClick={e=>e.target.classList.contains("popup") ? onClose() : null}>
			<div className="popup_wraper">
				<img src="/images/close.svg" className="close hover" draggable={false}
					onClick={onClose}
				/>
				{children}
			</div>
		</div>
	)
}

const UpdatePopup = ({
	onClose
}) => {
	return (
		<Popup onClose={onClose}>
			<div className="flex-center">
				<img src="/images/up-arrow.svg" height="64" draggable={false} style={{userSelect: "none"}}/>
				<h3 align="center"><LANG id="update_available"/></h3>
				<a className="button hover" href="https://github.com/SuperZombi/wot-modpack/releases" target="_blank">
					<LANG id="download"/>
				</a>
			</div>
		</Popup>
	)
}
