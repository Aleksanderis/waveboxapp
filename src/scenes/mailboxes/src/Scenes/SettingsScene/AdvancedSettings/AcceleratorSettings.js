import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import {
  Paper, TextField, IconButton, FontIcon,
  Table, TableRow, TableBody, TableRowColumn
} from 'material-ui'

const ACCELERATOR_NAMES = {
  // Global
  globalToggleApp: 'Toggle App',
  globalShowAppMailbox0: 'Show account in 1st position',
  globalShowAppMailbox1: 'Show account in 2nd position',
  globalShowAppMailbox2: 'Show account in 3rd position',
  globalShowAppMailbox3: 'Show account in 4th position',
  globalShowAppMailbox4: 'Show account in 5th position',
  globalShowAppMailbox5: 'Show account in 6th position',
  globalShowAppMailbox6: 'Show account in 7th position',
  globalShowAppMailbox7: 'Show account in 8th position',
  globalShowAppMailbox8: 'Show account in 9th position',
  globalShowAppMailbox9: 'Show account in 10th position',

  // Application
  preferences: 'Preferences',
  composeMail: 'Compose Mail',
  closeWindow: 'Close Window',
  hide: process.platform === 'darwin' ? 'Hide Wavebox' : 'Hide Window',
  hideOthers: 'Hide Others',
  quit: 'Quit',

  // Edit
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  pasteAndMatchStyle: 'Paste and Match Style',
  selectAll: 'Select All',
  copyCurrentTabUrl: 'Copy Current Tab URL',
  find: 'Find',
  findNext: 'Find Next',

  // View
  toggleFullscreen: 'Toggle Fullscreen',
  toggleSidebar: 'Toggle Sidebar',
  toggleMenu: 'Toggle Menu',
  navigateBack: 'Navigate Back',
  navigateForward: 'Navigate Forward',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  zoomReset: 'Zoom Reset',
  reload: 'Reload',
  reloadWavebox: 'Reload Wavebox Window',
  developerTools: 'Developer Tools',
  developerToolsWavebox: 'Wavebox Developer Tools',

  // Window
  minimize: 'Minimize',
  cycleWindows: 'Cycle Windows',
  previousMailbox: 'Previous Account',
  nextTab: 'Next Account / Service',
  prevTab: 'Previous Account / Service',
  nextMailbox: 'Next Account',
  mailboxIndex: 'Account at Index',
  servicePrevious: 'Previous Service',
  serviceNext: 'Next Service',
  serviceIndex: 'Service at Index'
}
const GLOBAL_SECTION = [
  'globalToggleApp',
  'globalShowAppMailbox0',
  'globalShowAppMailbox1',
  'globalShowAppMailbox2',
  'globalShowAppMailbox3',
  'globalShowAppMailbox4',
  'globalShowAppMailbox5',
  'globalShowAppMailbox6',
  'globalShowAppMailbox7',
  'globalShowAppMailbox8',
  'globalShowAppMailbox9'
]
const APPLICATION_SECTION = [
  'preferences',
  'composeMail',
  'closeWindow',
  'hide',
  'hideOthers',
  'quit'
]
const EDIT_SECTION = [
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'pasteAndMatchStyle',
  'selectAll',
  'copyCurrentTabUrl',
  'find',
  'findNext'
]
const VIEW_SECTION = [
  'toggleFullscreen',
  'toggleSidebar',
  'toggleMenu',
  'navigateBack',
  'navigateForward',
  'zoomIn',
  'zoomOut',
  'zoomReset',
  'reload',
  'reloadWavebox',
  'developerTools',
  'developerToolsWavebox'
]
const WINDOW_SECTION = [
  'minimize',
  'cycleWindows',
  'previousMailbox',
  'nextTab',
  'prevTab',
  'nextMailbox',
  'mailboxIndex',
  'servicePrevious',
  'serviceNext',
  'serviceIndex'
]
const SECTIONS = [
  { name: 'Application', items: APPLICATION_SECTION },
  { name: 'Edit', items: EDIT_SECTION },
  { name: 'View', items: VIEW_SECTION },
  { name: 'Window', items: WINDOW_SECTION },
  { name: 'Global', subtitle: 'These shortcuts will also work when Wavebox is minimized or out of focus', items: GLOBAL_SECTION }
]
const PLATFORM_EXCLUDES = new Set([
  process.platform === 'darwin' ? 'toggleMenu' : undefined,
  process.platform !== 'darwin' ? 'hideOthers' : undefined
].filter((n) => !!n))

export default class AcceleratorSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    accelerators: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the table row for an accelerator
  * @param accelerators: the accelerators
  * @param name: the name of the field to render for
  * @param isFirst: true if this is the first row
  * @param isLast: true if this is the last row
  * @return jsx
  */
  renderAcceleratorTableRow (accelerators, name, isFirst, isLast) {
    if (PLATFORM_EXCLUDES.has(name)) { return undefined }

    const accelerator = accelerators[name]
    const acceleratorDefault = accelerators[name + 'Default']

    // Put the key on the TextField so when the value is changed this will be updated
    return (
      <TableRow key={name}>
        <TableRowColumn>{ACCELERATOR_NAMES[name]}</TableRowColumn>
        <TableRowColumn style={{ overflow: 'visible', textAlign: 'right' }}>
          <TextField
            key={accelerator}
            name={`AcceleratorSettings_${name}`}
            style={{ width: 180 }}
            hintText={acceleratorDefault}
            defaultValue={accelerator}
            onBlur={(evt) => settingsActions.sub.accelerators.set(name, evt.target.value)} />
          {acceleratorDefault ? (
            <IconButton
              onClick={() => settingsActions.sub.accelerators.restoreDefault(name)}
              tooltipPosition={isLast ? 'top-center' : 'bottom-center'}
              tooltip={`Restore Default (${acceleratorDefault})`}>
              <FontIcon className='material-icons'>settings_backup_restore</FontIcon>
            </IconButton>
          ) : (
            <IconButton
              onClick={() => settingsActions.sub.accelerators.restoreDefault(name)}>
              <FontIcon className='material-icons'>delete</FontIcon>
            </IconButton>
          )}
        </TableRowColumn>
      </TableRow>
    )
  }

  /**
  * Renders the accelerator section
  * @param accelerators: the accelerators
  * @param section: the section to render
  * @return jsx
  */
  renderAcceleratorSection (accelerators, section) {
    return (
      <Paper key={section.name} zDepth={1} style={styles.paper}>
        <h1 style={styles.subheading}>{`${section.name} Shortcuts`}</h1>
        {section.subtitle ? (
          <p style={styles.subheadingInfo}>{section.subtitle}</p>
        ) : undefined}
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            {section.items.map((name, index, items) => this.renderAcceleratorTableRow(accelerators, name, index === 0, index === items.length - 1))}
          </TableBody>
        </Table>
      </Paper>
    )
  }

  render () {
    const {
      accelerators,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <h1 style={styles.heading}>Keyboard Shortcuts</h1>
        {SECTIONS.map((section) => this.renderAcceleratorSection(accelerators, section))}
      </div>
    )
  }
}
