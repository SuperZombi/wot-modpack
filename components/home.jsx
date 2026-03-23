const Home = ({mods_count}) => {
	const [totalInstalls, setTotalInstalls] = React.useState(0)
	React.useEffect(() => {
		loadStatsPage("342255871", data=>setTotalInstalls(Math.max(0, data.length-1)))
	}, [])
	const features = [
		{ icon: "fa-feather", titleKey: "featureSmallSizeTitle", descKey: "featureSmallSizeDesc" },
		{ icon: "fa-compass-drafting", titleKey: "featureModernDesignTitle", descKey: "featureModernDesignDesc" },
		{ icon: "fa-cloud-arrow-down", titleKey: "featureCloudModsTitle", descKey: "featureCloudModsDesc" },
		{ icon: "fa-layer-group", titleKey: "featureAllClientsTitle", descKey: "featureAllClientsDesc" },
		{ icon: "fa-shield-halved", titleKey: "featureOpenSourceTitle", descKey: "featureOpenSourceDesc" },
	]
	return (
		<React.Fragment>
			<div className="container" align="center">
				<Reveal>
					<img src="web/images/home_img.jpg" className="home_image" width="480" height="240" alt="Modpack preview" draggable={false}/>
					<h2><LANG id="downloadModpackButton"/></h2>
				</Reveal>
				<div className="row" style={{fontSize: "1.1em"}}>
					<Reveal delay={1}>
						<a className="button shine" href="https://github.com/SuperZombi/wot-modpack/releases/latest/download/Web.Modpack.exe">
							<i className="fa-solid fa-circle-down"></i>
							<span><LANG id="download_button"/></span>
						</a>
					</Reveal>
					<Reveal delay={2}>
						<a className="button shine" href="https://github.com/SuperZombi/wot-modpack">
							<i className="fa-brands fa-github"></i>
							<span>GitHub</span>
						</a>
					</Reveal>
					<Reveal delay={3}>
						<a className="button shine" href="https://wgmods.net/7156/">
							<i className="fa-solid fa-globe"></i>
							<span>WGmods</span>
						</a>
					</Reveal>
				</div>
			</div>
			
			<div className="container row" style={{fontSize: "14px", gap: "2rem"}}>
				<StatCard value={mods_count} label={<LANG id="mods_count"/>}/>
				<StatCard value={totalInstalls} label={<LANG id="installations"/>} delay={2}/>
			</div>

			<div className="container features-grid">
				{features.map((feature, idx) => (
					<Reveal className="container feature" key={idx} delay={idx}>
						<i className={`fa-solid ${feature.icon}`}></i>
						<div className="feature-block">
							<span className="feature-header"><LANG id={feature.titleKey}/></span>
							<span><LANG id={feature.descKey}/></span>
						</div>
					</Reveal>
				))}
			</div>
		</React.Fragment>
	)
}
const StatCard = ({ value, label, duration=2000, delay=0 }) => {
	return (
		<Reveal className="container stat-card shine" delay={delay}>
			<Counter to={value} duration={duration}/>
			<span>{label}</span>
		</Reveal>
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
const Reveal = ({ children, className="", delay=0, ...props }) => {
	const [visible, setVisible] = React.useState(false)
	const blockRef = React.useRef(null)

	React.useEffect(() => {
		const node = blockRef.current
		if (!node) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.unobserve(entry.target)
				}
			},
			{ threshold: 0.2 }
		)
		observer.observe(node)
		return () => observer.disconnect()
	}, [])
	return (
		<div
			ref={blockRef}
			className={`${className} reveal ${visible ? "visible" : ""}`}
			style={{ ...props.style, "--reveal-delay": `${delay * 80}ms` }}
			{...props}
		>
			{children}
		</div>
	)
}
