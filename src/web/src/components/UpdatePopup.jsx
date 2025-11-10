const UpdatePopup = ({
	onClose
}) => {
	return (
		<div className="popup show">
			<div className="popup_wraper" style={{height: "fit-content"}}>
				<img src="/images/close.svg" className="close hover" draggable={false}
					onClick={onClose}
				/>
				<div className="flex-center">
					<img src="/images/up-arrow.svg" height="64" draggable={false} style={{userSelect: "none"}}/>
					<h3 align="center"><LANG id="update_available"/></h3>
					<a className="button hover" href="https://github.com/SuperZombi/wot-modpack/releases" target="_blank">
						<LANG id="download"/>
					</a>
				</div>
			</div>
		</div>
	)
}
