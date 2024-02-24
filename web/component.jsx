'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = { liked: false };
	}

	render() {
		if (this.state.liked) {
			return 'You liked this.';
		}

		return (
			<button onClick={this.setState({liked: true})}>Like</button>
		);
	}
}

// const domContainer = document.querySelector('#like_button_container');
// const root = ReactDOM.createRoot(domContainer);
// root.render(e(LikeButton));

class RadiosArea extends React.Component {
	constructor(props) {
		super(props);
		// this.state = { opened: ''};
		this.change = this.change.bind(this)
		this.enableInput = this.enableInput.bind(this)

		this.setCollapse = (element) => {
			this.bsCollapse = new bootstrap.Collapse(element, {toggle: false})
			element.addEventListener('hidden.bs.collapse', this.enableInput)
			element.addEventListener('shown.bs.collapse', this.enableInput)
		}
		this.radios = []
		this.addRadio = el=>{
			this.radios.push(el)
		}
	}

	change(event){
		this.checkbox = event.target
		this.checkbox.disabled = true
		if (event.target.checked){
			this.radios[0].checked = true
			this.bsCollapse.show()
		} else {
			this.bsCollapse.hide()
			this.radios.forEach(el=>{
				el.checked = false
			})
		}
	}
	enableInput(){
		this.checkbox.disabled = false
	}

	render() {
		return (
			<fieldset style={{outline: '1px solid', borderRadius: '10px'}} className="p-2">
				<legend className="col-form-label p-1">
					<div className="form-check">
						<label>
							<input onChange={this.change} className="form-check-input" type="checkbox"/>
							<span>{this.props.summary}</span>
						</label>
					</div>
				</legend>
				<div className="collapse ps-1 pt-2" ref={this.setCollapse}>
					{this.props.data.map((option, index) => (
						<div key={index} className="form-check mb-1">
							<label>
								<input ref={this.addRadio} className="form-check-input" type="radio" name={this.props.summary} value={option.title}/>
								<span>{option.title}</span>
							</label>
						</div>
					))}
				</div>
			</fieldset>
		)
	}
}