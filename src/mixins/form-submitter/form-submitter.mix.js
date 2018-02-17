import Vue from 'vue'
import _ from 'lodash'
export default {
  data () {
    return {
      submitter: {}
    }
  },

  created () {
    if (!_.isArray(this.$options.forms) || !this.$options.forms.length) {
      throw Error('There is no forms defined for submitter')
    }

    _.forEach(this.$options.forms, function (formId) {
      Vue.set(this.submitter, formId, {
        sending: false,
        errorResponse: null
      })
    }.bind(this))
  },

  computed: {
    /**
     * Submitter data
     * @return {object}
     */
    $sd () {
      return this.submitter
    }
  },

  methods: {
    /**
     * Set `errorResponse` to NULL and set `sending` flag to `true` before send new request
     */
    submitStart (formId) {
      this.submitter[formId].errorResponse = null
      this.submitter[formId].sending = true
    },

    /**
     * Set `sending` flag to `false` on success response
     */
    submitOk (formId) {
      this.submitter[formId].sending = false
    },

    /**
     * Update `errorResponse` and set `sending` flag to `false` on request failed
     */
    submitFailed (formId, error) {
      this.submitter[formId].errorResponse = error
      this.submitter[formId].sending = false
    }
  }
}
