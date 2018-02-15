# vue-smart-form

[![npm](https://img.shields.io/npm/v/vue-smart-form.svg) ![npm](https://img.shields.io/npm/dm/vue-smart-form.svg)](https://www.npmjs.com/package/vue-smart-form)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Smart mixin implements basic features of form behavior

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)

# Installation

```
npm install --save vue-smart-form
```

## Default import

Install all the components:

```javascript
import Vue from 'vue'
import VueSmartForm from 'vue-smart-form'

Vue.use(VueSmartForm)
```

Use specific components:

```javascript
import Vue from 'vue'
import { Test } from 'vue-smart-form'

Vue.component('test', Test)
```

**⚠️ A css file is included when importing the package. You may have to setup your bundler to embed the css in your page.**

## Distribution import

Install all the components:

```javascript
import 'vue-smart-form/dist/vue-smart-form.css'
import VueSmartForm from 'vue-smart-form/dist/vue-smart-form.common'

Vue.use(VueSmartForm)
```

Use specific components:

```javascript
import 'vue-smart-form/dist/vue-smart-form.css'
import { Test } from 'vue-smart-form/dist/vue-smart-form.common'

Vue.component('test', Test)
```

**⚠️ You may have to setup your bundler to embed the css file in your page.**

## Browser

```html
<link rel="stylesheet" href="vue-smart-form/dist/vue-smart-form.css"/>

<script src="vue.js"></script>
<script src="vue-smart-form/dist/vue-smart-form.browser.js"></script>
```

The plugin should be auto-installed. If not, you can install it manually with the instructions below.

Install all the components:

```javascript
Vue.use(VueSmartForm)
```

Use specific components:

```javascript
Vue.component('test', VueSmartForm.Test)
```

## Source import

Install all the components:

```javascript
import Vue from 'vue'
import VueSmartForm from 'vue-smart-form/src'

Vue.use(VueSmartForm)
```

Use specific components:

```javascript
import Vue from 'vue'
import { Test } from 'vue-smart-form/src'

Vue.component('test', Test)
```

**⚠️ You need to configure your bundler to compile `.vue` files.** More info [in the official documentation](https://vuejs.org/v2/guide/single-file-components.html).

# Usage

> TODO

# Example

> TODO

---

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
