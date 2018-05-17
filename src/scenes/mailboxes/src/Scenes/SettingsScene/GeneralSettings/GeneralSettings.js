import PropTypes from 'prop-types'
import React from 'react'
import settingsStore from 'stores/settings/settingsStore'
import platformStore from 'stores/platform/platformStore'
import UISettingsSection from './UISettingsSection'
import NotificationSettingsSection from './NotificationSettingsSection'
import DownloadSettingsSection from './DownloadSettingsSection'
import LanguageSettingsSection from './LanguageSettingsSection'
import PlatformSettingsSection from './PlatformSettingsSection'
import TraySettingsSection from './TraySettingsSection'
/*import DownloadSettingsSection from './DownloadSettingsSection'


import TraySettingsSection from './TraySettingsSection'

import InfoSettingsSection from './InfoSettingsSection'
import PlatformSettingsSection from './PlatformSettingsSection'*/
import shallowCompare from 'react-addons-shallow-compare'
//import { Container, Row, Col } from 'Components/Grid'

export default class GeneralSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    platformStore.listen(this.platformChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    platformStore.unlisten(this.platformChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the settings state from the settings
  * @param store=settingsStore: the store to use
  */
  generateSettingsState (store = settingsStore.getState()) {
    return {
      ui: store.ui,
      os: store.os,
      extension: store.extension,
      language: store.language,
      tray: store.tray,
      accelerators: store.accelerators
    }
  }

  /**
  * Generates the platform state from the settings
  * @param store=platformStore: the store to use
  */
  generatePlatformState (store = platformStore.getState()) {
    return {
      openAtLoginSupported: store.loginPrefSupported(),
      mailtoLinkHandlerSupported: store.mailtoLinkHandlerSupported(),
      isMailtoLinkHandler: store.isMailtoLinkHandler()
    }
  }

  state = (() => {
    return Object.assign({}, this.generateSettingsState(), this.generatePlatformState())
  })()

  settingsChanged = (store) => {
    this.setState(this.generateSettingsState(store))
  }

  platformChanged = (store) => {
    this.setState(this.generatePlatformState(store))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      ui,
      os,
      language,
      extension,
      tray,
      accelerators,
      openAtLoginSupported,
      mailtoLinkHandlerSupported,
      isMailtoLinkHandler
    } = this.state
    const {showRestart, ...passProps} = this.props

    return (
      <div {...passProps}>
        <UISettingsSection ui={ui} os={os} accelerators={accelerators} extension={extension} showRestart={showRestart} />
        <NotificationSettingsSection os={os} />
        <DownloadSettingsSection os={os} />
        <LanguageSettingsSection language={language} showRestart={showRestart} />
        <PlatformSettingsSection
          mailtoLinkHandlerSupported={mailtoLinkHandlerSupported}
          isMailtoLinkHandler={isMailtoLinkHandler}
          openAtLoginSupported={openAtLoginSupported} />
        <TraySettingsSection tray={tray} showRestart={showRestart} />
      </div>
    )

    /*return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={6}>
              <UISettingsSection ui={ui} os={os} accelerators={accelerators} extension={extension} showRestart={showRestart} />
              <NotificationSettingsSection os={os} />
              <DownloadSettingsSection os={os} />
              <LanguageSettingsSection language={language} showRestart={showRestart} />
            </Col>
            <Col md={6}>
              <PlatformSettingsSection
                mailtoLinkHandlerSupported={mailtoLinkHandlerSupported}
                isMailtoLinkHandler={isMailtoLinkHandler}
                openAtLoginSupported={openAtLoginSupported} />
              <TraySettingsSection tray={tray} showRestart={showRestart} />
              <InfoSettingsSection />
            </Col>
          </Row>
        </Container>
      </div>
    )*/
  }
}
