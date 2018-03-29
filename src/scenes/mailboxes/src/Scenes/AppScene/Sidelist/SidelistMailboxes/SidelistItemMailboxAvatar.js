import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { MailboxAvatar } from 'Components/Mailbox'
import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import { DefaultServiceBadge, ServiceTooltip } from 'Components/Service'
import * as Colors from 'material-ui/styles/colors'
import uuid from 'uuid'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import UISettings from 'shared/Models/Settings/UISettings'
import Color from 'color'

const styles = {
  /**
  * Avatar
  */
  avatar: {
    display: 'block',
    transform: 'translate3d(0,0,0)', // fix for wavebox/waveboxapp#619
    margin: '4px auto',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },

  /**
  * Badge
  */
  badge: {
    position: 'absolute',
    height: 24,
    minWidth: 24,
    fontSize: '13px',
    borderRadius: 12,
    lineHeight: '24px',
    top: -6,
    right: 4,
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: Colors.red50,
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 4,
    paddingRight: 4
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 16
  },
  badgeContainer: {
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 0,
    paddingRight: 0,
    display: 'block',
    cursor: 'pointer'
  },

  /**
  * Active
  */
  activeIndicator: {
    position: 'absolute',
    left: 2,
    top: 25,
    width: 6,
    height: 6,
    marginTop: -3,
    borderRadius: '50%',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  }
}

export default class SidelistItemMalboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
  }

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      ...this.generateState(),
      isHovering: false,
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

  generateState (props = this.props) {
    const { mailboxId, serviceType } = props
    const mailboxState = mailboxStore.getState()
    const userState = userStore.getState()
    const mailbox = mailboxState.getMailbox(mailboxId)
    return {
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      showActiveIndicator: mailboxState.activeMailboxId() === mailboxId,
      isMailboxActive: mailboxState.activeMailboxId() === mailboxId,
      isDefaultServiceActive: mailboxState.isActive(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      isDefaultServiceSleeping: mailboxState.isSleeping(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      isAllServicesSleeping: mailboxState.isAllServicesSleeping(mailboxId),
      isRestricted: mailboxState.isMailboxRestricted(mailboxId),
      userHasServices: userState.user.hasServices
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    this.setState({
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      showActiveIndicator: mailboxState.activeMailboxId() === mailboxId,
      isMailboxActive: mailboxState.activeMailboxId() === mailboxId,
      isDefaultServiceActive: mailboxState.isActive(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      isDefaultServiceSleeping: mailboxState.isSleeping(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      isAllServicesSleeping: mailboxState.isAllServicesSleeping(mailboxId)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    })
  }

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      isRestricted: mailboxState.isMailboxRestricted(this.props.mailboxId),
      userHasServices: userState.user.hasServices
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      serviceType,
      ...passProps
    } = this.props
    const {
      isHovering,
      isMailboxActive,
      isDefaultServiceActive,
      isDefaultServiceSleeping,
      isAllServicesSleeping,
      isRestricted,
      mailbox,
      service,
      globalShowSleepableServiceIndicator,
      showActiveIndicator,
      tooltipsEnabled,
      userHasServices
    } = this.state
    if (!mailbox || !service) { return false }

    let borderColor
    let showSleeping
    let displayMailboxOverview
    if (mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR) {
      try {
        if (isDefaultServiceActive || isHovering) {
          borderColor = mailbox.color
        } else {
          borderColor = Color(mailbox.color).lighten(0.4).rgb().string()
        }
      } catch (ex) {
        borderColor = mailbox.color
      }
      showSleeping = isDefaultServiceSleeping && mailbox.showSleepableServiceIndicator && globalShowSleepableServiceIndicator
      displayMailboxOverview = userHasServices && mailbox.collapseSidebarServices && !isMailboxActive && mailbox.hasAdditionalServices
    } else {
      try {
        if (isMailboxActive || isHovering) {
          borderColor = mailbox.color
        } else {
          borderColor = Color(mailbox.color).lighten(0.4).rgb().string()
        }
      } catch (ex) {
        borderColor = mailbox.color
      }
      showSleeping = isAllServicesSleeping && mailbox.showSleepableServiceIndicator && globalShowSleepableServiceIndicator
      displayMailboxOverview = userHasServices && mailbox.hasAdditionalServices
    }

    return (
      <DefaultServiceBadge
        {...passProps}
        id={`ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`}
        isAuthInvalid={mailbox.isAuthenticationInvalid || !mailbox.hasAuth}
        mailboxId={mailbox.id}
        displayMailboxOverview={displayMailboxOverview}
        badgeStyle={styles.badge}
        style={styles.badgeContainer}
        iconStyle={styles.badgeFAIcon}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}>
        {showActiveIndicator ? (
          <div style={{ backgroundColor: mailbox.color, ...styles.activeIndicator }} />
        ) : undefined}
        <MailboxAvatar
          {...passProps}
          mailboxId={mailbox.id}
          size={42}
          draggable={false}
          style={{
            ...styles.avatar,
            boxShadow: `0 0 0 4px ${borderColor}`,
            filter: showSleeping ? 'grayscale(100%)' : 'none'
          }} />
        {tooltipsEnabled ? (
          <ServiceTooltip
            mailbox={mailbox}
            service={service}
            isRestricted={isRestricted}
            active={isHovering}
            tooltipTimeout={0}
            position='right'
            arrow='center'
            group={this.instanceId}
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Avatar-${this.instanceId}`} />
        ) : undefined}
      </DefaultServiceBadge>
    )
  }
}
