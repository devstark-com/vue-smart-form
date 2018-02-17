import _ from 'lodash'
import mixSmartForm from './mixins/smart-form/'
import mixFormSubmitter from './mixins/form-submitter/'

// Install the plugin
export function install (Vue, options) {
  const serverErrorsFormatter = _.get(options, 'serverErrorsFormatter')
  if (serverErrorsFormatter) {
    mixSmartForm.methods['formatServerErrors'] = serverErrorsFormatter
  }
}

// Expose exeports
export {
  mixSmartForm,
  mixFormSubmitter
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
const plugin = {
  /* eslint-disable no-undef */
  version: VERSION,
  install
}

export default plugin

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}
