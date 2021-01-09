# handlebars-helper-formatdate

Handlebars helper that format dates using moment.

## Installation

```
npm install handlebars-helper-formatdate
```

## Usage

In your templates:

```html
<h1>{{ title }}</h1>

<span class="post-date">On {{ formatDate date 'MMM DD YYYY' }}</span>
```

In your front matters:

```yaml
---
title: A post
description: A very simple post.
date: 2016-10-29
---
...
```

In your metalsmith script:

```js
var handlebars = require('handlebars');
var hbtdate = require('handlebars-helper-formatdate')(handlebars);
```

### **`handlebars`** `Object`

    A Handlebars instance.

## License

MIT License, see [LICENSE](https://github.com/ahdiaz/handlebars-helper-formatdate/blob/master/LICENSE.md) for details.
