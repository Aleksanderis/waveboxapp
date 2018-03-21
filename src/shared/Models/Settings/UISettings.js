const Model = require('../Model')

const SIDEBAR_NEWS_MODES = Object.freeze({
  ALWAYS: 'ALWAYS',
  UNREAD: 'UNREAD',
  NEVER: 'NEVER'
})
const ACCOUNT_TOOLTIP_MODES = Object.freeze({
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  SIDEBAR_ONLY: 'SIDEBAR_ONLY',
  TOOLBAR_ONLY: 'TOOLBAR_ONLY'
})

const VIBRANCY_MODES = Object.freeze({
  NONE: 'NONE',
  LIGHT: 'LIGHT',
  MEDIUM_LIGHT: 'MEDIUM_LIGHT',
  DARK: 'DARK',
  ULTRA_DARK: 'ULTRA_DARK'
})
const ELECTRON_VIBRANCY_MODES = Object.freeze({
  [VIBRANCY_MODES.NONE]: null,
  [VIBRANCY_MODES.LIGHT]: 'light',
  [VIBRANCY_MODES.MEDIUM_LIGHT]: 'medium-light',
  [VIBRANCY_MODES.DARK]: 'dark',
  [VIBRANCY_MODES.ULTRA_DARK]: 'ultra-dark'
})

class UISettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get SIDEBAR_NEWS_MODES () { return SIDEBAR_NEWS_MODES }
  static get ACCOUNT_TOOLTIP_MODES () { return ACCOUNT_TOOLTIP_MODES }
  static get VIBRANCY_MODES () { return VIBRANCY_MODES }

  /* **************************************************************************/
  // Titlebar
  /* **************************************************************************/

  get showTitlebar () { return this._value_('showTitlebar', process.platform !== 'darwin') }
  get showTitlebarCount () { return this._value_('showTitlebarCount', true) }
  get showTitlebarAccount () { return this._value_('showTitlebarAccount', true) }

  /* **************************************************************************/
  // App
  /* **************************************************************************/

  get showAppBadge () { return this._value_('showAppBadge', true) }
  get showAppMenu () { return this._value_('showAppMenu', process.platform !== 'win32') }
  get openHidden () { return this._value_('openHidden', false) }
  get showSleepableServiceIndicator () { return this._value_('showSleepableServiceIndicator', false) }
  get vibrancyMode () { return this._value_('vibrancyMode', VIBRANCY_MODES.NONE) }
  get electronVibrancyMode () { return ELECTRON_VIBRANCY_MODES[this.vibrancyMode] }

  /* **************************************************************************/
  // Sidebar
  /* **************************************************************************/

  get sidebarEnabled () { return this._value_('sidebarEnabled', true) }
  get showSidebarSupport () { return this._value_('showSidebarSupport', true) }
  get showSidebarNewsfeed () { return this._value_('showSidebarNewsfeed', SIDEBAR_NEWS_MODES.ALWAYS) }
  get accountTooltipMode () {
    const val = this._value_('accountTooltipMode', undefined)
    if (val !== undefined) { return val }

    const depricatedVal = this._value_('sidebarTooltipsEnabled', undefined)
    if (depricatedVal === true) { return ACCOUNT_TOOLTIP_MODES.ENABLED }
    if (depricatedVal === false) { return ACCOUNT_TOOLTIP_MODES.DISABLED }
    return ACCOUNT_TOOLTIP_MODES.ENABLED
  }

  /* **************************************************************************/
  // CSS
  /* **************************************************************************/

  get customMainCSS () { return this._value_('customMainCSS', undefined) }
  get hasCustomMainCSS () { return !!this.customMainCSS }
}

module.exports = UISettings
