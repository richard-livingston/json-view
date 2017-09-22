# JSONTreeView

A simple JSON viewer with basic edit capabilities. It has styles similar to Chrome's dev tools, so it's perfect for building dev tools extensions... **[live example](https://richard-livingston.github.io/json-view/)**.

### Install with NPM
`npm i json-tree-view`

### Build example
`./example/build.sh`
See ./example/build directory.

### Basic usage

*index.js*
```js
var JSONTreeView = require('json-tree-view');

var view = new JSONTreeView('example', {
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
view.on('change', function(self, key, oldValue, newValue){
    console.log('change', key, oldValue, '=>', newValue);
});
view.on('rename', function(self, key, oldName, newName) {
    console.log('rename', key, oldName, '=>', newName);
});
view.on('delete', function(self, key) {
    console.log('delete', key);
});
view.on('append', function(self, key, nameOrValue, newValue) {
    console.log('append', key, nameOrValue, '=>', newValue);
});

// Expand recursively
view.expand(true);

view.withRootName = false;

// Inspect window.data on the console and note that it changes with edits.
window.data = view.value;

view.value.f.pop()
view.value.f.push(9)
view.value.e.a = 'aaa';
delete view.value.c;
view.refresh();

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
