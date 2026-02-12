const Home = ({mods_count, totalInstalls, lang}) => {
	return (
		<React.Fragment>
			<div className="container" align="center">
				<img src="images/home_img.jpg" className="home_image" draggable={false}/>
				<h2>{LANG.downloadModpackButton[lang]}</h2>
				<div className="row" style={{fontSize: "1.1em"}}>
					<a className="button" href="https://github.com/SuperZombi/wot-modpack/releases/latest/download/Web.Modpack.exe">
						<i className="fa-solid fa-circle-down"></i>
						<span>{LANG.download_button[lang]}</span>
					</a>
					<a className="button" href="https://github.com/SuperZombi/wot-modpack">
						<i className="fa-brands fa-github"></i>
						<span>GitHub</span>
					</a>
					<a className="button" href="https://wgmods.net/7156/">
						<i className="fa-solid fa-globe"></i>
						<span>WGmods</span>
					</a>
				</div>
			</div>
			
			<div className="container row" style={{fontSize: "14px", gap: "2rem"}}>
				<StatCard value={mods_count} duration={2000} label={LANG.mods_count[lang]}/>
				<StatCard value={totalInstalls} duration={2000} label={LANG.installations[lang]}/>
			</div>
		</React.Fragment>
	)
}
const StatCard = ({ value, duration, label }) => {
	return (
		<div className="container stat-card">
			<Counter to={value} duration={duration}/>
			<span>{label}</span>
		</div>
	)
}
const Counter = ({ to, duration }) => {
	const [value, setValue] = React.useState(0)
	React.useEffect(() => {
		const startTime = performance.now()
		function animate(now) {
			const progress = Math.min((now - startTime) / duration, 1)
			const current = Math.floor(progress * to)
			setValue(current)
			if (progress < 1) { requestAnimationFrame(animate) }
		}
		requestAnimationFrame(animate)
	}, [to, duration])
	return (
		<span>{value}</span>
	)
}
