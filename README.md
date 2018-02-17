# vue-smart-form

[![npm](https://img.shields.io/npm/v/vue-smart-form.svg) ![npm](https://img.shields.io/npm/dm/vue-smart-form.svg)](https://www.npmjs.com/package/vue-smart-form)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Plugin provides two mixins with basic features of form behavior and form submission

Plugin based on `vuelidate` package and doesn't work without it, so `vuelidate` should be installed and registered in application via `Vue.use()`

**Form mixin features:**
- sync with parent via `v-model`
- sync with parent via `state` prop with `sync` modifier
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
|uid||
|value||
|state||
|sending||
|serverResponse||
|disableSuccessFields||
|touchDelay||

**Data properties**

|name|description|
|----|-----------|
|fields||
|vmessages||
|subforms||

**Computed properties**

|name|description|
|----|-----------|
|$vstate||
|$vf||
|isFormComplete||
|subformsHasErrors||
|areSubformsDirty||

**Methods**

|name|description|
|----|-----------|
|formDataCompose||
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
