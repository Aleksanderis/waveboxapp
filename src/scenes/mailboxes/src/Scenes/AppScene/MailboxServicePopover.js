import PropTypes from 'prop-types'
import React from 'react'
import { Popover, Menu, MenuItem, Divider, FontIcon } from 'material-ui'
import { mailboxActions, mailboxDispatch, mailboxStore, MailboxLinker } from 'stores/mailbox'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

class SleepAllIcon extends React.Component {
  render () {
    const { color, ...passProps } = this.props
    return (
      <span {...passProps}>
        <FontIcon className='material-icons' color={color}>hotel</FontIcon>
        <FontIcon className='material-icons' color={color} style={{ left: -12 }}>clear_all</FontIcon>
      </span>
    )
  }
}

export default class SidelistItemMailboxPopover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    onRequestClose: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.renderTO = null
    mailboxStore.listen(this.mailboxesChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    clearTimeout(this.renderTO)
    mailboxStore.unlisten(this.mailboxesChanged)
    userStore.unlisten(this.userChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
      this.setState(this.generateState(nextProps))
    }
    if (this.props.isOpen !== nextProps.isOpen) {
      if (nextProps.isOpen) {
        clearTimeout(this.renderTO)
        this.setState({ rendering: true })
      } else {
        clearTimeout(this.renderTO)
        this.renderTO = setTimeout(() => {
          this.setState({ rendering: false })
        }, 500)
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    ...this.generateState(),
    rendering: this.props.isOpen
  }

  generateState (props = this.props) {
    const { mailboxId, serviceType } = props
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : null

    return {
      mailbox: mailbox,
      service: service,
      userHasSleepable: userStore.getState().user.hasSleepable,
      isServiceSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isServiceActive: mailboxState.isActive(mailboxId, serviceType)
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : null

    this.setState({
      mailbox: mailbox,
      service: service,
      serviceSupportsSleeping: service ? service.sleepable : false,
      isServiceSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isServiceActive: mailboxState.isActive(mailboxId, serviceType)
    })
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evtOrFn: the fired event or a function to call on closed
  */
  handleClosePopover = (evtOrFn) => {
    this.props.onRequestClose()
    if (typeof (evtOrFn) === 'function') {
      setTimeout(() => { evtOrFn() }, 300)
    }
  }

  /**
  * Deletes this mailbox
  */
  handleDelete = () => {
    window.location.hash = `/mailbox_delete/${this.props.mailboxId}`
    this.handleClosePopover()
  }

  /**
  * Reloads this mailbox
  */
  handleReload = () => {
    const { mailboxId, serviceType } = this.props
    mailboxActions.changeActive(mailboxId, serviceType)
    setTimeout(() => {
      mailboxDispatch.reload(mailboxId, serviceType)
    }, 100) // Give the UI some time to catch up
    this.handleClosePopover()
  }

  /**
  * Re-syncs the mailbox
  */
  handleResync = () => {
    mailboxActions.fullSyncMailbox(this.props.mailboxId)
    this.handleClosePopover()
  }

  /**
  * Handles the user requesting an account reauthentication
  */
  handleClearBrowserSession = () => {
    mailboxActions.clearMailboxBrowserSession(this.props.mailboxId)
    this.handleClosePopover()
  }

  /**
  * Handles opening the account settings
  */
  handleAccountSettings = () => {
    this.handleClosePopover(() => {
      window.location.hash = `/settings/accounts/${this.props.mailboxId}`
    })
  }

  /**
  * Handles reauthenticting the mailbox
  */
  handleReauthenticate = () => {
    mailboxActions.reauthenticateMailbox(this.props.mailboxId)
    this.handleClosePopover()
  }

  /**
  * Handles waking the service
  */
  handleAwakenService = () => {
    this.handleClosePopover(() => {
      mailboxActions.awakenService(this.props.mailboxId, this.props.serviceType)
    })
  }

  /**
  * Handles sleeping the service
  */
  handleSleepService = () => {
    this.handleClosePopover(() => {
      mailboxActions.sleepService(this.props.mailboxId, this.props.serviceType)
    })
  }

  /**
  * Handles sleeping all services
  */
  handleSleepAllServices = () => {
    this.handleClosePopover(() => {
      mailboxActions.sleepAllServices(this.props.mailboxId)
    })
  }

  /**
  * Handles opening a service in a new window
  */
  handleOpenInWindow = () => {
    const { mailboxId, serviceType } = this.props
    this.handleClosePopover()
    const url = mailboxDispatch.getCurrentUrl(mailboxId, serviceType) || this.state.service.url
    MailboxLinker.openContentWindow(mailboxId, serviceType, url)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the menu items
  * @return array of jsx elements
  */
  renderMenuItems () {
    const { mailbox, userHasSleepable, isServiceSleeping, service } = this.state
    const menuItems = []

    // Identification & Status
    if (mailbox.displayName) {
      menuItems.push(
        <MenuItem
          key='info'
          primaryText={`${service.humanizedTypeShort} : ${mailbox.displayName}`}
          disabled />
      )
    }
    menuItems.push(
      <MenuItem
        key='open_in_window'
        primaryText='Open in New Window'
        onClick={this.handleOpenInWindow}
        leftIcon={<FontIcon className='material-icons'>open_in_new</FontIcon>} />
    )
    if (userHasSleepable && (service || {}).sleepable) {
      if (isServiceSleeping) {
        menuItems.push(
          <MenuItem
            key='awaken'
            primaryText='Awaken'
            onClick={this.handleAwakenService}
            leftIcon={<FontIcon className='material-icons'>alarm</FontIcon>} />
        )
      } else {
        menuItems.push(
          <MenuItem
            key='sleep'
            primaryText='Sleep'
            onClick={this.handleSleepService}
            leftIcon={<FontIcon className='material-icons'>hotel</FontIcon>} />
        )
      }
    }

    if (userHasSleepable && mailbox.enabledServices.length > 1) {
      const sleepableService = mailbox.enabledServices.find((s) => s.sleepable)
      if (sleepableService) {
        menuItems.push(
          <MenuItem
            key='sleep_all'
            primaryText='Sleep All'
            onClick={this.handleSleepAllServices}
            leftIcon={<SleepAllIcon />} />
        )
      }
    }
    if (!isServiceSleeping) {
      menuItems.push(
        <MenuItem
          key='reload'
          primaryText='Reload'
          onClick={this.handleReload}
          leftIcon={<FontIcon className='material-icons'>refresh</FontIcon>} />
      )
    }
    menuItems.push(
      <MenuItem
        key='sync'
        primaryText='Resync'
        onClick={this.handleResync}
        leftIcon={<FontIcon className='material-icons'>sync</FontIcon>} />
    )
    if (mailbox.supportsAuth) {
      const invalid = mailbox.isAuthenticationInvalid || !mailbox.hasAuth
      menuItems.push(
        <MenuItem
          key='reauthenticate'
          primaryText='Reauthenticate'
          onClick={this.handleReauthenticate}
          style={invalid ? { color: Colors.red600 } : undefined}
          leftIcon={invalid ? (
            <FontIcon className='material-icons' style={{ color: Colors.red600 }}>error_outline</FontIcon>
          ) : (
            <FontIcon className='material-icons'>lock_outline</FontIcon>
          )} />
      )
    }
    menuItems.push(<Divider key='div-actions' />)

    // Account Settings
    menuItems.push(
      <MenuItem
        key='settings'
        primaryText='Account Settings'
        onClick={this.handleAccountSettings}
        leftIcon={<FontIcon className='material-icons'>settings</FontIcon>} />
    )
    if (mailbox.artificiallyPersistCookies) {
      menuItems.push(
        <MenuItem
          key='reauthenticate'
          primaryText='Clear All Cookies'
          onClick={this.handleClearBrowserSession}
          leftIcon={<FontIcon className='material-icons'>layers_clear</FontIcon>} />
      )
    }
    menuItems.push(
      <MenuItem
        key='delete'
        primaryText='Delete'
        onClick={this.handleDelete}
        leftIcon={<FontIcon className='material-icons'>delete</FontIcon>} />
    )

    return menuItems
  }

  render () {
    const { isOpen, anchor } = this.props
    const { mailbox, service, rendering } = this.state
    if (!mailbox || !service || !rendering) { return false }

    return (
      <Popover
        open={isOpen}
        anchorEl={anchor}
        anchorOrigin={{ horizontal: 'middle', vertical: 'center' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={this.handleClosePopover}>
        <Menu desktop onEscKeyDown={this.handleClosePopover}>
          {this.renderMenuItems()}
        </Menu>
      </Popover>
    )
  }
}
