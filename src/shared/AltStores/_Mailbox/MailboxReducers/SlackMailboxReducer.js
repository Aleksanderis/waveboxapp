import MailboxReducer from './MailboxReducer'

class SlackMailboxReducer extends MailboxReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'SlackMailboxReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the basic profile info for this account
  * @param mailbox: the mailbox to update
  * @param teamOverview: the overview of the team
  * @param selfOverview: the overview of the user
  */
  static setTeamAndSelfOverview (mailbox, teamOverview, selfOverview) {
    return mailbox.changeData({
      teamOverview: teamOverview,
      selfOverview: selfOverview
    })
  }

  /**
  * Indicates that the authentication information on the mailbox is invalid
  * @param mailbox: the mailbox to update
  */
  static invalidateAuth (mailbox) {
    if (!mailbox.isAuthenticationInvalid) {
      return mailbox.changeDataWithChangeset({
        auth: { isInvalid: true }
      })
    }
  }

  /**
  * Indicates that the authentication information on the mailbox is valid
  * @param mailbox: the mailbox to update
  */
  static revalidateAuth (mailbox) {
    if (mailbox.isAuthenticationInvalid) {
      return mailbox.changeDataWithChangeset({
        auth: { isInvalid: false }
      })
    }
  }

  /**
  * Sets the mailbox authentication details
  * @param mailbox: the mailbox to update
  * @param auth: the auth info
  */
  static setAuth (mailbox, auth) {
    return mailbox.changeData({ auth: auth })
  }
}

export default SlackMailboxReducer
