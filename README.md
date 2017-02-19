# JSONView

A simple JSON viewer with basic edit capabilities. It has styles similar to Chrome's dev tools, so it's perfect for building dev tools extensions... **[live example](https://richard-livingston.github.io/json-view/)**.

### Install with NPM
`npm i json-view`

### Basic usage

*index.js*
```js
var JSONView = require('json-view');

var view = new JSONView('example', {
    hello : 'world',
    doubleClick : 'me to edit',
    a : null,
    b : true,
    c : false,
    d : 1,
    e : {nested : 'object'},
    f : [1,2,3]
});

// Listen for change events
view.on('change', function(key, oldValue, newValue){
    console.log('change', key, oldValue, '=>', newValue);
});

// Expand recursively
view.expand(true);

// Inspect window.data on the console and note that it changes with edits.
window.data = view.value;


```

*index.html* - (**don't forget to include the css**)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JSONView Example</title>
    <link rel="stylesheet" href="devtools.css">
    <script src="index.js" defer></script>
</head>
<body>

</body>
</html>
```

The above will produce the same results as the **[demo page](https://richard-livingston.github.io/json-view/)**.