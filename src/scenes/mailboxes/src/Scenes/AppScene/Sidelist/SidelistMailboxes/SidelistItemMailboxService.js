import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar } from 'material-ui'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import { ServiceBadge, ServiceTooltip } from 'Components/Service'
import * as Colors from 'material-ui/styles/colors'
import uuid from 'uuid'
import Resolver from 'Runtime/Resolver'
import UISettings from 'shared/Models/Settings/UISettings'
import classnames from 'classnames'

const styles = {
  /**
  * Avatar
  */
  avatar: {
    display: 'block',
    margin: '4px auto',
    borderWidth: 3,
    borderStyle: 'solid',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  /**
  * Badge
  */
  badge: {
    position: 'absolute',
    height: 20,
    minWidth: 20,
    fontSize: '11px',
    borderRadius: 10,
    lineHeight: '20px',
    top: -3,
    right: 8,
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: Colors.red50,
    fontWeight: process.platform === 'linux' ? 'normal' : '300',
    width: 'auto',
    paddingLeft: 6,
    paddingRight: 6
  },
  badgeFAIcon: {
    color: 'white',
    fontSize: 12
  },
  badgeContainer: {
    padding: 0,
    display: 'block',
    cursor: 'pointer'
  }
}

export default class SidelistItemMailboxService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired
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
      instanceId: uuid.v4(),
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator,
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

  generateState (props = this.props) {
    const { mailboxId, serviceType } = props
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(mailboxId)
    return {
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isRestricted: mailboxState.isMailboxRestricted(mailboxId)
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    this.setState({
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isSleeping: mailboxState.isSleeping(mailboxId, serviceType)
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
      isRestricted: mailboxState.isMailboxRestricted(this.props.mailboxId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param mailboxType: the type of mailbox
  * @param serviceType: the service type
  * @return the url of the service icon
  */
  getServiceIconUrl (mailboxType, serviceType) {
    const ServiceClass = ServiceFactory.getClass(mailboxType, serviceType)
    return ServiceClass ? Resolver.image(ServiceClass.humanizedLogo) : ''
  }

  render () {
    const {
      mailboxId,
      serviceType,
      onOpenService,
      style,
      className,
      ...passProps
    } = this.props
    const {
      isHovering,
      isActive,
      isSleeping,
      mailbox,
      service,
      isRestricted,
      globalShowSleepableServiceIndicator,
      tooltipsEnabled
    } = this.state
    if (!mailbox || !service) { return false }

    const borderColor = mailbox.showAvatarColorRing ? (
      isActive || isHovering ? mailbox.color : 'white'
    ) : 'transparent'

    const showSleeping = isSleeping && mailbox.showSleepableServiceIndicator && globalShowSleepableServiceIndicator
    return (
      <ServiceBadge
        id={`ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`}
        isAuthInvalid={false}
        supportsUnreadCount={service.supportsUnreadCount}
        showUnreadBadge={service.showUnreadBadge}
        unreadCount={service.unreadCount}
        supportsUnreadActivity={service.supportsUnreadActivity}
        showUnreadActivityBadge={service.showUnreadActivityBadge}
        hasUnreadActivity={service.hasUnreadActivity}
        color={service.unreadBadgeColor}
        badgeStyle={styles.badge}
        style={styles.badgeContainer}
        iconStyle={styles.badgeFAIcon}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={(evt) => onOpenService(evt, serviceType)}>
        <Avatar
          {...passProps}
          src={this.getServiceIconUrl(mailbox.type, serviceType)}
          size={35}
          backgroundColor='white'
          draggable={false}
          className={classnames('WB-ServiceIcon', `WB-ServiceIcon-${mailbox.id}_${service.type}`, className)}
          style={{
            ...styles.avatar,
            borderColor: borderColor,
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
            parent={`#ReactComponent-Sidelist-Item-Mailbox-Service-${this.instanceId}`} />
        ) : undefined}
      </ServiceBadge>
    )
  }
}
