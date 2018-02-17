# vue-smart-form

[![npm](https://img.shields.io/npm/v/vue-smart-form.svg) ![npm](https://img.shields.io/npm/dm/vue-smart-form.svg)](https://www.npmjs.com/package/vue-smart-form)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Plugin provides two mixins with basic features of form behavior and form submission

Plugin based on `vuelidate` package and doesn't work without it, so `vuelidate` should be installed and registered in application via `Vue.use()`

**Form mixin features:**
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
- customizing validation error messages with gracefull degradation from field-specific meessages to common messages for specific validator

**Submitter mixin features:**
- controlling `sending` state passed into child component with form
- storing server response to pass into form
- `submitStart`, `submitOk`, `submitFailed` methods to integrate with API calls
- support of multiple forms in single parent component

## Table of contents

- [Installation](#installation)
- [Example](#example)
- [Interfaces](#interfaces)

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

# Example

You can play around with that [here](https://codesandbox.io/s/3yr865plyp)

# Interfaces
### mixSmartForm

**Props**

|name|description|
|----|-----------|
|uid|Unique form identifier. Can be used for repeateable forms rendered via v-for to handle vstate updates in parent|
|value|Object with initial values, the part of binding with parent via v-model. Useful only if we need to populate form with any data from parent component|
|state|The form state contains form fields values and form validation state. This prop is in sync with a parent via `.sync` modifier|
|sending|Should be passed from parent and used inside a form to indicate that request is performing|
|serverResponse|Response from server if code is 400. Should be passed from parent. Triggers displaying error messages from server-side to user|
|disableSuccessFields|Allows to disable success state for all or for some array of fields|
|touchDelay|Delay in ms between touch() method called and validation really triggered ($touch called)|

**Data properties**

|name|description|
|----|-----------|
|fields|All form fields used via `v-model` should be placed inside this object|
|vmessages|All validation messages should be described here|
|subforms|Subforms states objects. Validation state of each particular subform should be exeplicitly binded via `state.sync`|

**Computed properties**

|name|description|
|----|-----------|
|$vstate|Aggregated validation state with merged client & server side validation errors. See its structure under this table|
|$vf|Just a shorthand for `$vstate.fields`|
|isFormComplete|Returns `true` if all fields are dirty and valid (all required fields filled with valid values)|
|areSubformsComplete|Indicates are all subforms complete|
|subformsHasErrors|Indicates are there errors in subforms|
|areSubformsDirty|Returns `true` if all subforms are dirty, and `false` if at least one not|

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
      type: String // 'is-success', 'is-danger' - can be used to setup appropriate class to a field wrapper
    }
  },
  subforms: { // aggregated info about subforms validation result
    error: Boolean, // true if at least one subform has an error
    complete: Boolean // true if all subforms are complete
  }
}
```

**Methods**

|name|description|
|----|-----------|
|formDataCompose|Can be overridden in components to define a custom logic of composing data before 'submit' event emitted|
|setServerErrors||
|formatServerErrors||
|onInput||
|onBlur||
|autofocusCall||
|reset||
|touch||
|submit||
|submitResult||


================================================================================

# Plugin Development

## Installation

The first time you create or clone your plugin, you need to install the default dependencies:

```
npm install
```

## Watch and compile

This will run webpack in watching mode and output the compiled files in the `dist` folder.

```
npm run dev
```

## Use it in another project

While developping, you can follow the install instructions of your plugin and link it into the project that uses it.

In the plugin folder:

```
npm link
```

In the other project folder:

```
npm link vue-smart-form
```

This will install it in the dependencies as a symlink, so that it gets any modifications made to the plugin.

## Publish to npm

You may have to login to npm before, with `npm adduser`. The plugin will be built in production mode before getting published on npm.

```
npm publish
```

## Manual build

This will build the plugin into the `dist` folder in production mode.

```
npm run build
```

---

## License

[MIT](http://opensource.org/licenses/MIT)
