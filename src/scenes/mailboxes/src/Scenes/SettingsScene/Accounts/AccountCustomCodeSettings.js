import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton, FontIcon, Paper } from 'material-ui' //TODO
import commonStyles from '../CommonSettingStyles'
import { mailboxActions, ServiceReducer, mailboxDispatch } from 'stores/mailbox'
import { USER_SCRIPTS_WEB_URL } from 'shared/constants'
import * as Colors from 'material-ui/styles/colors' //TODO
import electron from 'electron'

const styles = {
  userscriptLink: {
    color: Colors.blue700,
    fontSize: '85%',
    marginBottom: 10
  }
}

export default class AccountCustomCodeSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, service, onRequestEditCustomCode, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={commonStyles.paper} {...passProps}>
        <h1 style={commonStyles.subheading}>Custom Code & Userscripts</h1>
        <div>
          <RaisedButton
            style={commonStyles.buttonInline}
            label='Custom CSS'
            icon={<FontIcon className='material-icons'>code</FontIcon>}
            onClick={() => {
              onRequestEditCustomCode('Custom CSS', service.customCSS, (code) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomCSS, code)
                mailboxDispatch.reload(mailbox.id, service.type)
              })
            }} />
        </div>
        <div>
          <RaisedButton
            style={commonStyles.buttonInline}
            label='Custom JS'
            icon={<FontIcon className='material-icons'>code</FontIcon>}
            onClick={() => {
              onRequestEditCustomCode('Custom JS', service.customJS, (code) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setCustomJS, code)
                mailboxDispatch.reload(mailbox.id, service.type)
              })
            }} />
        </div>
        <div style={commonStyles.button}>
          <a
            style={styles.userscriptLink}
            onClick={(evt) => { evt.preventDefault(); electron.remote.shell.openExternal(USER_SCRIPTS_WEB_URL) }}
            href={USER_SCRIPTS_WEB_URL}>Find custom userscripts</a>
        </div>
      </Paper>
    )
  }
}
