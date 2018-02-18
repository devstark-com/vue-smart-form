# vue-smart-form

[![npm](https://img.shields.io/npm/v/vue-smart-form.svg) ![npm](https://img.shields.io/npm/dm/vue-smart-form.svg)](https://www.npmjs.com/package/vue-smart-form)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Plugin provides two mixins:
- `mixSmartForm` with basic form features
- `mixFormSubmitter` with some common submit-related logic

☝️ The `mixSmartForm` mixin is based on [Vuelidate](https://github.com/monterail/vuelidate) package and doesn't work without it, so `vuelidate` should be installed and registered in application via `Vue.use()`

☝️ You should be familiar with [Vuelidate](https://github.com/monterail/vuelidate) package. [Docs](https://monterail.github.io/vuelidate/#getting-started)

## Table of contents

- [Installation](#installation)
- [Interface of mixSmartForm](#mixsmartform)
- [Interface of mixFormSubmitter](#mixformsubmitter)
- [Example](#example)
- [Features list](#features)

# Installation

```
npm install --save vue-smart-form
```

## Import and register plugin

```javascript
import Vue from 'vue'
import VueSmartForm from 'vue-smart-form'

Vue.use(VueSmartForm, {
  serverErrorsFormatter: function (response) {
    // custom logic to fit API errors with expected format
  }
})
```

## Import specific mixins in your components:

Form mixin:

```javascript
import { mixSmartForm } from 'vue-smart-form'
```

Form submitter mixin:

```javascript
import { mixFormSubmitter } from 'vue-smart-form'
```
# mixSmartForm

**Props**

|name|description|
|----|-----------|
|**uid**|Unique form identifier. Can be used for repeateable forms rendered via `v-for` to handle `$vstate` updates in parent.|
|**value**|Object with initial values, the part of `v-model` binding. Useful only if we need to populate form with any initial data from parent component.|
|**state**|The readonly form state object aggregates fields values and validation states. This prop is in sync with a parent via `.sync` modifier. It's strongly recommended to use this prop in one-way binding manner just to obtain state updates in parent component.|
|**sending**|Should be passed from parent and used inside a form e.g. to show loader or block UI|
|**serverResponse**|Response from server if code is 400. Should be passed from parent. Triggers displaying error messages from server-side to user.|
|**disableSuccessFields**|Allows to disable success state for all fields or for array of fields|
|**touchDelay**|Delay in ms between `touch()` method called and validation really triggered (Vuelidate's `$touch()` called)|

**Data properties**

|name|description|
|----|-----------|
|**fields**|Object. All form fields which should be validated and added to form data in submit payload, should be placed in this property. See example for more details|
|**vmessages**|All validation messages should be described here|
|**subforms**|Subforms states. State of each particular subform should be exeplicitly binded with child subform via `state.sync`|

**Computed properties**

|name|description|
|----|-----------|
|**$vstate**|Aggregated validation state with merged client & server side validation errors. See structure under the table|
|**$vf**|Just a shorthand for `$vstate.fields`. So you can use `$vf.email.msg` instead of `$vstate.fields.email.msg`|
|**isFormComplete**|Returns `true` if all fields are dirty and valid - all required fields are filled with valid values and each field has `complete: true`|
|**areSubformsComplete**|Returns `true` if all subforms are complete|
|**subformsHasErrors**|Returns `true` if at least one subform has an error|
|**areSubformsDirty**|Returns `true` if all subforms are dirty, and `false` if at least one - not|

`$vstate` structure

```javascript
{
  dirty: Boolean, // true if at least one field is dirty (was touched)
  error: Boolean, // true if at least one field has an error (subforms errors are not included)
  complete: Boolean, // true if all fields are complete (was filled and successfully validated at the client-side)
  client: Boolean, // true if there is at least one client-side validation error
  server: Boolean, // true if there is at least one server-side validation error
  fields: { // object contains validation details by each field
    somefield: {
      dirty: Boolean, // true if the field was touched
      complete: Boolean, // true if the field was touched and successfully validated
      error: Boolean, // true if there is validation error (client-side or server-side whatever)
      msg: String, // client-side validation message from `vmessages` or raw message received from server-side
      source: String, // indicates error source, can be 'client' or 'server'
      type: String // 'is-success', 'is-danger' - can be used to setup appropriate class to a field wrapper. Initially it was hardcoded to use with Buefy's `<b-field>` component.
    }
  },
  subforms: { // aggregated info about results of subforms validation
    error: Boolean, // true if at least one subform has an error
    complete: Boolean // true if all subforms are complete
  }
}
```

**Methods**

|name|description|
|----|-----------|
|**formDataCompose()**|Returns compacted (without empty values) `fields` object. Can be overridden in components to define a custom logic of composing data for `submit` event payload|
|**formatServerErrors(response)**|Can be overridden in components to define a custom logic to fit server response with expected format|
|**onInput(fieldName)**|Input event handler. Usage example `<input v-model="fields.lastname" @input="onInput('lastname') />"`. This handler performs `this.reset(fieldname)` call and then consecutive calls of `this.vModelSync()` and `this.stateSync()`. If you wanna just reset validation errors and avoid syncing with parent on input, you can use `reset` method as event handler, e.g. `@input="reset('lastname')`|
|**onBlur(fieldName)**|Can be used to trigger field validation on blur. It's just a delayed call of `this.touch(fieldname)`|
|**reset(fieldname)**|Reset validation state. Will reset a state of particular field if a name of a field is passed and will reset all form (states for all fields) if called without arguments or passed field doesn't exist in `$data.fields`|
|**touch(fieldname)**|Run validation. Will validate a particular field if a name of a field is passed and will validate all fields in a form if called without arguments or passed field doesn't exist in `$data.fields`|
|**submit()**|Triggers form validation and emits corresponding event with form data in the payload|
|**submitResult()**||
|**autofocusCall()**||

**Events**

|name|payload|description|
|----|-------|-----------|
|**input**|Result of `this.formDataCompose()`|Just a part of `v-model` binding, fires only in one case: right after `onInput(fieldName)` call|
|**vstateUpdated**|`{`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`uid: 'some-uid',`<br />&nbsp;&nbsp;&nbsp;&nbsp;`vstate: {...}`<br/>`}`|Fires on: <br/> - `created` hook<br/> - `$vstate` changed.<br/> Payload is an object with unique form identifier in `uid` property and with actual validation state object in `vstate` property.|
|**update:state**|`{`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`uid: 'some-id',`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`fields: {...},`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`vstate: {...}`<br />&nbsp;&nbsp;&nbsp;&nbsp;`subforms: {...}`<br/>`}`|Fires on:<br/> - `created` hook<br/> - `onInput` call<br/> - `$vstate` changed<br/> - `subforms` property in `data` changed<br/> - `beforeDestroy` hook.|
|**submit**|Result of `this.formDataCompose()`|Fires after `submit()` call but only if validation passed|

**Server-side errors handling** option<br/>
Use the `serverErrorsFormatter` plugin option to pass a custom function to fit server response with format expected by mixin.<br />
Expected format is:
```javascript
{
  fieldName: [
    'some error message',
    'another error message'
  ],
  anotherFieldName: [
    // ...
  ],
  //...
}
```
So if your back-end send you e.g. the following:
```javascript
[
  {
    property_path: 'fieldName',
    message: 'Some shit happened'
  }
]
```
you can just define `serverErrorsFormatter` function, e.g.:
```javascript
Vue.use(VueSmartForm, {
  serverErrorsFormatter: function (response) {
    return response.data.reduce((res, item) => {
      if (!_.get(res, item.property_path)) res[item.property_path] = []
      res[item.property_path].push(item.message)
      return res
    }, {})
  }
})
```

# mixFormSubmitter

**Component option**

In your component you must define the separate root option `forms` with array of forms ids.<br/>
E.g.
```javascript
components: {
  // ...
},
forms: ['loginForm', 'registrationForm'],
props: {
  // ...
}
```

**Data properties**

|name|structure|description|
|----|---------|-----------|
|**submitter**|`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`form1: {`<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`sending: Boolean,`<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`errorResponse: null`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`}`<br/>`}`|Stores submitter data (`sending` and `errorResponse` values)<br/> grouped by form id.<br/> `errorResponse` can be `Array`, `Object`, `String` or `NULL`<br/>it depends on your back-end.|

**Computed properties**

|name|description|
|----|-----------|
|**$sd**|Submitter data. Just returns `this.submitter`|


**Methods**

|name|description|
|----|-----------|
|**submitStart(formId)**|Sets `this.submitter[formId].errorResponse` to `NULL` and `this.submitter[formId].sending` to `true`. You should call this method right before making request to your back-end.|
|**submitOk(formId)**|It just sets `this.submitter[formId].sending` to `false`. You should use this method in case of success response with code `200` or `2xx`.|
|**submitFailed(formId, error)**|Sets an error response into `this.submitter[formId].errorResponse` and sets `this.submitter[formId].sending` to `false`. You should use this method in case of error with code `400`.|

# Example

You can play around with that [here](https://codesandbox.io/s/3yr865plyp)

# Features

**Form mixin features list:**
- sync with parent via `v-model`
- sync fields values and validation state with parent via `state` prop with `sync` modifier
- reactive validation state
- merging of client-side and server-side validation errors to provide the easy way to display validation errors messages of both types in one place
- subforms validation with reactive validation state tree (also syncable via `state.sync`)
- support of multiple forms in single parent component
- `sending` state handling (can be used to block UI while request is performing)
- double submit protection
- server response handling
- ability to set a delay between `$touch` called and validation really triggered to prevent flashing of error messages in case of conditional forms switching
- is form complete detection (all rquired fields are filled with valid values)
- prefilling form with initial data
- ability to define custom function `serverErrorsFormatter` to fit error response from your back-end with format expected by mixin
- autofocusing desired field when form mounted
- perfectly fits with Buefy framework components `<b-field>` and `<b-input>`
- customizing validation error messages with gracefull degradation from field-specific messages to common messages for specific validator

**Submitter mixin features list:**
- controlling `sending` state passed into child component with form
- storing server response to pass into form
- `submitStart`, `submitOk`, `submitFailed` methods to integrate with API calls
- support of multiple forms in single parent component

## License

[MIT](http://opensource.org/licenses/MIT)
