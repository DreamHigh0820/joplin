const React = require('react'); const Component = React.Component;
const { TouchableOpacity , Button, Text, Image, StyleSheet, ScrollView, View } = require('react-native');
const { connect } = require('react-redux');
const Icon = require('react-native-vector-icons/Ionicons').default;
const Tag = require('lib/models/Tag.js');
const Note = require('lib/models/Note.js');
const Folder = require('lib/models/Folder.js');
const Setting = require('lib/models/Setting.js');
const { FoldersScreenUtils } = require('lib/folders-screen-utils.js');
const { Synchronizer } = require('lib/synchronizer.js');
const { reg } = require('lib/registry.js');
const { _ } = require('lib/locale.js');
const { globalStyle, themeStyle } = require('lib/components/global-style.js');
const shared = require('lib/components/shared/side-menu-shared.js');

class SideMenuContentComponent extends Component {

	constructor() {
		super();
		this.state = { syncReportText: '',
			//width: 0,
		};
		this.styles_ = {};
	}

	styles() {
		const theme = themeStyle(this.props.theme);

		if (this.styles_[this.props.theme]) return this.styles_[this.props.theme];
		this.styles_ = {};

		let styles = {
			menu: {
				flex: 1,
				backgroundColor: theme.backgroundColor,
				borderTopWidth: 1,
				borderTopColor: theme.dividerColor,
			},
			button: {
				flex: 1,
				flexDirection: 'row',
				height: 36,
				alignItems: 'center',
				paddingLeft: theme.marginLeft,
				paddingRight: theme.marginRight,
			},
			buttonText: {
				flex: 1,
				color: theme.color,
				paddingLeft: 10,
				fontSize: theme.fontSize,
			},
			syncStatus: {
				paddingLeft: theme.marginLeft,
				paddingRight: theme.marginRight,
				color: theme.colorFaded,
				fontSize: theme.fontSizeSmaller,
			},
			tagItemList: {
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap'
			},
		};

		styles.folderButton = Object.assign({}, styles.button);
		styles.folderButtonText = Object.assign({}, styles.buttonText);
		styles.folderButtonSelected = Object.assign({}, styles.folderButton);
		styles.folderButtonSelected.backgroundColor = theme.selectedColor;
		styles.folderIcon = Object.assign({}, theme.icon);
		styles.folderIcon.color = '#0072d5';

		styles.tagButton = Object.assign({}, styles.button);
		styles.tagButtonSelected = Object.assign({}, styles.tagButton);
		styles.tagButtonSelected.backgroundColor = theme.selectedColor;
		styles.tagButtonSelected.borderRadius = 1000;
		styles.tagButtonText = Object.assign({}, styles.buttonText);
		styles.tagButtonText.flex = 0;

		styles.syncButton = Object.assign({}, styles.button);
		styles.syncButtonText = Object.assign({}, styles.buttonText);

		this.styles_[this.props.theme] = StyleSheet.create(styles);
		return this.styles_[this.props.theme];
	}

	folder_press(folder) {
		this.props.dispatch({ type: 'SIDE_MENU_CLOSE' });

		this.props.dispatch({
			type: 'NAV_GO',
			routeName: 'Notes',
			folderId: folder.id,
		});
	}

	tag_press(tag) {
		this.props.dispatch({ type: 'SIDE_MENU_CLOSE' });

		this.props.dispatch({
			type: 'NAV_GO',
			routeName: 'Notes',
			tagId: tag.id,
		});
	}

	async synchronize_press() {
		const actionDone = await shared.synchronize_press(this);
		if (actionDone === 'auth') this.props.dispatch({ type: 'SIDE_MENU_CLOSE' });
	}

	folderItem(folder, selected) {
		const iconComp = selected ? <Icon name='md-folder-open' style={this.styles().folderIcon} /> : <Icon name='md-folder' style={this.styles().folderIcon} />;
		const folderButtonStyle = selected ? this.styles().folderButtonSelected : this.styles().folderButton;

		return (
			<TouchableOpacity key={folder.id} onPress={() => { this.folder_press(folder) }}>
				<View style={folderButtonStyle}>
					{ iconComp }
					<Text numberOfLines={1} style={this.styles().folderButtonText}>{Folder.displayTitle(folder)}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	tagItem(tag, selected) {
		const iconComp = <Icon name='md-pricetag' style={this.styles().folderIcon} />
		const tagButtonStyle = selected ? this.styles().tagButtonSelected : this.styles().tagButton;

		return (
			<TouchableOpacity key={tag.id} onPress={() => { this.tag_press(tag) }}>
				<View style={tagButtonStyle}>
					{ iconComp }
					<Text numberOfLines={1} style={this.styles().tagButtonText}>{Tag.displayTitle(tag)}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	synchronizeButton(state) {
		const theme = themeStyle(this.props.theme);
		
		const title = state == 'sync' ? _('Synchronise') : _('Cancel synchronisation');
		const iconComp = state == 'sync' ? <Icon name='md-sync' style={theme.icon} /> : <Icon name='md-close' style={theme.icon} />;

		return (
			<TouchableOpacity key={'synchronize_button'} onPress={() => { this.synchronize_press() }}>
				<View style={this.styles().syncButton}>
					{ iconComp }
					<Text style={this.styles().syncButtonText}>{title}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	makeDivider(key) {
		return <View style={{ marginTop: 15, marginBottom: 15, flex: -1, borderBottomWidth: 1, borderBottomColor: globalStyle.dividerColor }} key={key}></View>
	}

	render() {
		let items = [];

		const theme = themeStyle(this.props.theme);

		// HACK: inner height of ScrollView doesn't appear to be calculated correctly when
		// using padding. So instead creating blank elements for padding bottom and top.
		items.push(<View style={{ height: globalStyle.marginTop }} key='bottom_top_hack'/>);

		if (this.props.folders.length) {
			const folderItems = shared.renderFolders(this.props, this.folderItem.bind(this));
			items = items.concat(folderItems);
			if (items.length) items.push(this.makeDivider('divider_1'));
		}

		if (this.props.tags.length) {
			const tagItems = shared.renderTags(this.props, this.tagItem.bind(this));

			items.push(
				<View style={this.styles().tagItemList} key="tag_items">
					{tagItems}
				</View>
			);

			if (tagItems.length) items.push(this.makeDivider('divider_2'));
		}

		let lines = Synchronizer.reportToLines(this.props.syncReport);
		while (lines.length < 10) lines.push(''); // Add blank lines so that height of report text is fixed and doesn't affect scrolling
		const syncReportText = lines.join("\n");

		items.push(this.synchronizeButton(this.props.syncStarted ? 'cancel' : 'sync'));

		items.push(<Text key='sync_report' style={this.styles().syncStatus}>{syncReportText}</Text>);

		items.push(<View style={{ height: globalStyle.marginBottom }} key='bottom_padding_hack'/>);

		let style = {
			flex:1,
			borderRightWidth: 1,
			borderRightColor: globalStyle.dividerColor,
			backgroundColor: theme.backgroundColor,
		};

		return (
			<View style={style}>
				<View style={{flex:1, opacity: this.props.opacity}}>
					<View style={{flexDirection:'row'}}>
						<Image style={{flex:1, height: 100}} source={require('../images/SideMenuHeader.png')} />
					</View>
					<ScrollView scrollsToTop={false} style={this.styles().menu}>
						{ items }
					</ScrollView>
				</View>
			</View>
		);
	}
};

const SideMenuContent = connect(
	(state) => {
		return {
			folders: state.folders,
			tags: state.tags,
			syncStarted: state.syncStarted,
			syncReport: state.syncReport,
			selectedFolderId: state.selectedFolderId,
			selectedTagId: state.selectedTagId,
			notesParentType: state.notesParentType,
			locale: state.settings.locale,
			theme: state.settings.theme,
			opacity: state.sideMenuOpenPercent,
		};
	}
)(SideMenuContentComponent)

module.exports = { SideMenuContent };