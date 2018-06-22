import MailboxReducer from './MailboxReducer'

class MicrosoftMailboxReducer extends MailboxReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MicrosoftMailboxReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the basic profile info for this account
  * @param mailbox: the mailbox to update
  * @param userId: the users id
  * @param email: the user email address
  * @param userFullName: the users full name
  */
  static setProfileInfo (mailbox, userId, email, userFullName) {
    return mailbox.changeData({
      userId: userId,
      email: email,
      userFullName: userFullName
    })
  }

  /**
  * Sets the auth info for this account
  * @param mailbox: the mailbox to update
  * @param auth: the auth object to set
  */
  static setAuthInfo (mailbox, auth) {
    return mailbox.changeData({
      auth: {
        protocolVersion: mailbox.authProtocolVersion,
        ...auth
      }
    })
  }
}

export default MicrosoftMailboxReducer
