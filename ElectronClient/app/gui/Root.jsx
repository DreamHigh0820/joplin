const React = require('react');
const { render } = require('react-dom');
const { createStore } = require('redux');
const { connect, Provider } = require('react-redux');

const { NoteList } = require('./gui/NoteList.min.js');
const { NoteText } = require('./gui/NoteText.min.js');

const { app } = require('electron').remote.require('./app');

class ReactRootComponent extends React.Component {

	render() {
		const style = {
			width: this.props.size.width,
			height: this.props.size.height,
		};

		const noteListStyle = {
			width: Math.floor(this.props.size.width / 2),
			height: this.props.size.height,
			display: 'inline-block',
			verticalAlign: 'top',
		};

		const noteTextStyle = {
			width: this.props.size.width - noteListStyle.width,
			height: this.props.size.height,
			display: 'inline-block',
			verticalAlign: 'top',
		};

		return (
			<div style={style}>
				<NoteList itemHeight={40} style={noteListStyle}></NoteList>
				<NoteText style={noteTextStyle}></NoteText>
			</div>
		);
	}

}

const mapStateToProps = (state) => {
	return {
		size: state.windowContentSize,
	};
};

const ReactRoot = connect(mapStateToProps)(ReactRootComponent);

const store = app().store();

render(
	<Provider store={store}>
		<ReactRoot />
	</Provider>,
	document.getElementById('react-root')
)