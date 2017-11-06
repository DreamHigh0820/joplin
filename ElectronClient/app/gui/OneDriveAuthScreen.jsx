const React = require('react');
const { connect } = require('react-redux');
const { reg } = require('lib/registry.js');
const { bridge } = require('electron').remote.require('./bridge');
const { Header } = require('./Header.min.js');
const { themeStyle } = require('../theme.js');
const { _ } = require('lib/locale.js');

class OneDriveAuthScreenComponent extends React.Component {

	constructor() {
		super();
		this.webview_ = null;
		this.authCode_ = null;
	}

	refresh_click() {
		if (!this.webview_) return;
		this.webview_.src = this.startUrl();
	}

	componentWillMount() {
		this.setState({
			webviewUrl: this.startUrl(),
			webviewReady: false,
		});
	}

	componentDidMount() {
		this.webview_.addEventListener('dom-ready', this.webview_domReady.bind(this));
	}

	componentWillUnmount() {
		this.webview_.addEventListener('dom-ready', this.webview_domReady.bind(this));
	}

	webview_domReady() {
		this.setState({ webviewReady: true });
		
		this.webview_.addEventListener('did-navigate', async (event) => {
			const url = event.url;

			if (this.authCode_) return;
			if (url.indexOf(this.redirectUrl() + '?code=') !== 0) return;

			let code = url.split('?code=');
			this.authCode_ = code[1];

			try {
				await reg.oneDriveApi().execTokenRequest(this.authCode_, this.redirectUrl(), true);
				this.props.dispatch({ type: 'NAV_BACK' });
				reg.scheduleSync(0);
			} catch (error) {
				bridge().showMessageBox({
					type: 'error',
					message: error.message,
				});
			}

			this.authCode_ = null;
		});
	}

	startUrl() {
		return reg.oneDriveApi().authCodeUrl(this.redirectUrl());
	}

	redirectUrl() {
		return reg.oneDriveApi().nativeClientRedirectUrl();
	}

	render() {
		const style = this.props.style;
		const theme = themeStyle(this.props.theme);

		const headerStyle = {
			width: style.width,
		};

		const webviewStyle = {
			width: this.props.style.width,
			height: this.props.style.height - theme.headerHeight,
			overflow: 'hidden',
		};

		const headerButtons = [
			{
				title: _('Refresh'),
				onClick: () => this.refresh_click()
			},
		];

		return (
			<div>
				<Header style={headerStyle} buttons={headerButtons} />
				<webview src={this.startUrl()} style={webviewStyle} nodeintegration="1" ref={elem => this.webview_ = elem} />
			</div>
		);
	}

}

const mapStateToProps = (state) => {
	return {};
};

const OneDriveAuthScreen = connect(mapStateToProps)(OneDriveAuthScreenComponent);

module.exports = { OneDriveAuthScreen };