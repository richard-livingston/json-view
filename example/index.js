/**
 * Created by r1ch4 on 02/10/2016.
 */

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

view.on('change', function(key, oldValue, newValue){
    console.log('change', key, oldValue, '=>', newValue);
});

view.expand(true);

document.body.appendChild(view.dom);
window.view = view;