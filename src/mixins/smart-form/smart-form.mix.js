import _ from 'lodash'
export default {
  props: {
    /**
     * Unique form identifier
     * Can be used for repeateable forms rendered via v-for to handle vstate updates in parent
     */
    uid: {
      type: String,
      default: 'smart-form'
    },

    /**
     * The part of binding with parent via v-model
     * Useful only if we need to populate form with any data from parent component
     */
    value: {
      type: Object,
      default: null
    },

    /**
     * The form state that keeps form fields values and validation states of a fields
     * This prop is in sync with a parent via `.sync` modifier
     */
    state: {
      type: Object,
      default: function () {
        return {
          fields: {}
        }
      }
    },

    /**
     * Can be passed from parent and used inside
     * form to indicate that request is performing
     */
    sending: {
      type: Boolean,
      default: false
    },

    /**
     * Response from server if code is not 200
     * Triggers displaying error messages from backend to user
     */
    serverResponse: {
      default: null
    },

    /**
     * Allows to disable success state for all or for some array of fields
     */
    disableSuccessFields: {
      type: [Boolean, Array],
      default: false
    },

    /**
     * Delay in ms between touch() method called and validation really triggered ($touch called)
     */
    touchDelay: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // this is a distinctive feature of vm instance which uses this mixin
      __smartform: true,
      isSending: false,
      serverErrors: null,
      awaitSubmit: false,
      noSync: false,
      subforms: {}
    }
  },
  computed: {
    /**
     * return `fields` property from validations definition
     * @return {object}
     */
    validationsList () {
      let validations = null
      // validations may be a function type in case of dynamic schema
      // https://monterail.github.io/vuelidate/#sub-dynamic-validation-schema
      if (_.isFunction(this.$options.validations)) {
        validations = this.$options.validations()
      // or a plain object
      } else if (_.isPlainObject(this.$options.validations)) {
        validations = this.$options.validations
      }

      return _.get(validations, 'fields', null)
    },

    /**
     * Short getter for states of fields
     * @return {object}
     */
    $vf () {
      return this.$vstate.fields
    },

    /**
     * Aggregated validation state with merged client & server side validation errors
     * @return {object}
     */
    $vstate () {
      let res = {
        dirty: _.get(this.$v, 'fields.$dirty', false),
        // means that at least one field has an error
        error: false,
        // means that all fields was filled and successfully validated at the client
        complete: true,
        // means that there are client-side validation errors
        client: false,
        // means that there are server-side validation errors
        server: false,
        // validation states of fields
        fields: {},
        // aggregated validation state of all subforms
        subforms: {
          // are there any errors in subforms
          error: false,
          // are all subforms complete
          complete: false
        }
      }

      // walk over fields we have in fact
      _.forEach(this.fields, function (fieldValue, fieldName) {
        // make an assumption that field is ok
        _.set(res.fields, fieldName, {
          error: false,
          msg: null,
          type: ''
        })

        // CHECK CLIENT-SIDE ERRORS

        if (_.has(this.validationsList, fieldName)) {
          _.set(res.fields[fieldName], 'dirty', this.$v.fields[fieldName].$dirty)
          let complete = this.$v.fields[fieldName].$dirty && !this.$v.fields[fieldName].$invalid
          _.set(res.fields[fieldName], 'complete', complete)
          if (!complete) {
            res.complete = false
          }

          // if the field has an error
          if (this.$v.fields[fieldName].$error) {
            // mark field as with error
            _.set(res.fields[fieldName], 'error', true)
            res.error = true
            res.client = true

            // then walking over s set of defined validators
            _.forEach(this.validationsList[fieldName], function (validator, validatorName) {
              // and if validator dosn't said ok
              if (!this.$v.fields[fieldName][validatorName]) {
                // apply appropriate message using graceful degradation
                // multilingual errors translation may be implemented here
                _.set(res.fields[fieldName], 'msg', _.get(this.vmessages[fieldName], validatorName, _.get(this.vmessages, validatorName, validatorName)))
                _.set(res.fields[fieldName], 'source', 'client')
                // stop walking over a set of validators
                // @todo need to come up with how to avoid "pink rose" issue
                return false
              }
            }.bind(this))
          }
        }

        if (res.fields[fieldName].error) {
          // don't need to check for any validation errors from a server if there is client-side validation error,
          // because there is can not be any requests to server in case of client-side validation failed
          return
        }

        // CHECK SERVER-SIDE ERRORS
        if (this.serverErrors !== null) {
          _.forEach(this.serverErrors, function (val, key) {
            if (key !== fieldName) {
              return
            }

            res.error = true
            res.server = true
            res.complete = false
            let msg = val[0]
            _.set(res.fields[key], 'source', 'server')
            _.set(res.fields[key], 'error', true)
            _.set(res.fields[key], 'complete', false)
            _.set(res.fields[key], 'msg', _.get(this.vmessages[key], msg, _.get(this.vmessages, msg, msg)))
            // @todo need to figure out how to avoid "pink rose" issue
            return false
          }.bind(this))
        }
      }.bind(this))

      // Handle input types
      _.forEach(res.fields, function (params, name) {
        if (params.error) {
          params.type = 'is-danger'
          return
        }

        if (this.disableSuccessFields === true || (_.isArray(this.disableSuccessFields) && this.disableSuccessFields.includes('name'))) {
          return
        }

        if (params.complete) {
          params.type = 'is-success'
        }
      }.bind(this))

      // Aggregate subforms vstate
      res.subforms.complete = this.isSubformsComplete
      res.subforms.error = this.subformsHasErrors
      res.subforms.dirty = this.areSubformsDirty

      return res
    },

    /**
     * can be overridden in components
     * @return {boolean}
     */
    isFormComplete () {
      return this.$vstate.complete
    },

    /**
     * Indicates are all subforms complete
     * @return {boolean}
     */
    isSubformsComplete () {
      const incomplete = _.find(this.subforms, function (object) {
        return _.get(object, 'vstate.complete', null) === false
      })
      return incomplete === undefined
    },

    /**
     * Indicates are there errors in subforms
     * @return {boolean}
     */
    subformsHasErrors () {
      const hasErrors = _.find(this.subforms, function (object) {
        return _.get(object, 'vstate.error', null) === true
      })
      return hasErrors !== undefined
    },

    /**
     * @return {boolean}
     */
    areSubformsDirty () {
      return _.every(this.subforms, function (item) {
        // continue if some optional subform not in use and equal to NULL
        return item === null || item.vstate.dirty
      })
    },

    /**
     * @return {(Array.<string>|null)}
     */
    serverErrorMessages () {
      if (!this.serverErrors) return null
      return this.serverErrors.map(e => e.message.message || e.message)
    },

    /*
     * Temp solution for dispaying server errors
     */
    serverError () {
      if (!this.serverErrors) return null
      return this.serverErrors.message || this.serverErrors[0]
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        this.populate()
      }
    },

    sending (val) {
      this.setSending(val)
    },

    /**
     * For update errors from server
     */
    serverResponse (response) {
      if (_.get(response, 'status', null) === 400) {
        this.setServerErrors(response)
      }
    },

    '$vstate': {
      deep: true,
      handler (value, old) {
        this.vstateSync(value)
        this.stateSync()
      }
    },

    /**
     * Watch for subforms states changes and propagate
     * updated self state to a parent component
     */
    subforms: {
      deep: true,
      handler () {
        this.stateSync()
      }
    },

    /**
     * Waiting when form becomes valid to trigger submit
     */
    isFormComplete (val) {
      // setTimeout here used to be able to affect to awaitSubmit value out
      // of the form before the event will be emitted
      setTimeout(function () {
        if (val && this.awaitSubmit) {
          this.submitResult(this.formDataCompose())
        }
        this.setAwaitSubmit(false)
      }.bind(this), 0)
    }
  },
  methods: {
    populate () {
      if (!this.value) return
      _.forEach(this.value, function (value, key) {
        this.$set(this.fields, key, value)
      }.bind(this))
    },

    /**
     * @param {boolean} val
     * @return void
     */
    setSending (val) {
      this.isSending = val
    },

    setAwaitSubmit (val) {
      this.awaitSubmit = val
    },

    /**
     * Can be overridden in components
     */
    formDataCompose () {
      return _.pickBy(this.fields, _.identity)
    },

    setServerErrors (response) {
      this.serverErrors = this.formatServerErrors(response)
    },

    /*
     * Default behavior - no formatting
     */
    formatServerErrors (response) {
      return response
    },

    onInput (fieldName) {
      this.reset(fieldName)
      this.vModelSync()
      this.stateSync()
    },

    preventSync (val = true) {
      this.noSync = val
    },

    /**
     * Sync current form fields with parent component via v-model
     */
    vModelSync () {
      if (this.noSync) return
      this.$emit('input', this.formDataCompose())
    },

    /**
     * Sync validation state of the form with parent component via emitting `vtateUpdated` event
     */
    vstateSync (val) {
      if (this.noSync) return
      let state = !val ? this.$vstate : val
      this.$emit('vstateUpdated', Object.assign({uid: this.uid}, {vstate: state}))
    },

    /**
     * Sync prop `state` value to parent via `.sync`
     */
    stateSync () {
      if (this.noSync) return
      this.$emit('update:state', {
        uid: this.uid,
        fields: Object.assign({}, this.fields),
        vstate: Object.assign({}, this.$vstate),
        subforms: this.subforms
      })
    },

    onBlur (fieldName, delayBeforeTouch = 0) {
      // setTimeout here is for autocomplete (line <b-autocomplete>) fields only to prevent flashing
      // of invalid state at selection by mouse click
      setTimeout(function () {
        this.touch(fieldName)
      }.bind(this), delayBeforeTouch)
    },

    /**
     * Wrapper which can be overridden in components
     */
    autofocusCall () {
      this.autofocus()
    },

    /**
     * @todo need figure out right approach to access via $refs ony appropriate elements
     */
    autofocus () {
      _.forEach(this.$refs, function (objRef, refKey) {
        if (objRef === undefined) {
          return
        }

        let el = objRef.$el !== undefined ? objRef.$refs[objRef._data._elementRef] : objRef
        if (el && el.hasAttribute !== undefined && el.hasAttribute('data-autofocus')) {
          objRef.focus()
          return false
        }
      })
    },

    /**
     * Programmatically run form validation
     */
    validate () {
      this.reset()
      this.touch()
    },

    /**
     * @param {Vue} vm
     */
    _hasSmartFormMixin (vm) {
      return vm && _.has(vm.$data, '__smartform')
    },

    reset (fieldName = null) {
      if (!fieldName) {
        if (this.$v) {
          this.$v.$reset()
        }
        this.serverErrors = null

        _.forEach(this.$refs, function (object, refKey) {
          if (this._hasSmartFormMixin(object)) {
            object.reset()
          }
        }.bind(this))
        return
      }

      if (_.has(this.$v.fields, fieldName)) {
        this.$v.fields[fieldName].$reset()
      }

      if (_.has(this.serverErrors, fieldName)) {
        this.$delete(this.serverErrors, fieldName)
      }
    },

    touch (fieldName = null) {
      this.setAwaitSubmit(false)
      setTimeout(function () {
        if (!fieldName) {
          if (this.$v) {
            this.$v.$touch()
          }

          _.forEach(this.$refs, function (object, refKey) {
            if (this._hasSmartFormMixin(object)) {
              object.touch()
            }
          }.bind(this))
          return
        }

        if (_.has(this.$v.fields, fieldName)) {
          this.$v.fields[fieldName].$touch()
        }
      }.bind(this), this.touchDelay)
    },

    /**
     * Validate form and fire an event
     */
    submit () {
      if (this.isSending) {
        return
      }

      this.setAwaitSubmit(false)
      if (!this.isFormComplete) {
        this.validate()
        // submit will be triggered from watcher for isFormComplete
        this.setAwaitSubmit(true)
        return
      }

      this.submitResult(this.formDataCompose())
    },

    submitResult (data) {
      this.$emit('submit', this.formDataCompose())
    }
  },
  created () {
    this.populate()
    this.setSending(this.sending)
    this.vstateSync()
    this.stateSync()
  },
  mounted () {
    this.$nextTick(function () {
      this.autofocusCall()
    })
  },
  beforeDestroy () {
    if (this.noSync) return
    this.$emit('update:state', null)
  }
}
