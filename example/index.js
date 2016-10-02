/**
 * Created by r1ch4 on 02/10/2016.
 */

var JSONView = require('json-view');

var view = new JSONView({
    name : 'example',
    value : {
        hello : 'world',
        doubleClick : 'me to edit',
        a : null,
        b : true,
        c : false,
        d : 1,
        e : {nested : 'object'},
        f : [1,2,3]
    }
});

document.body.appendChild(view.dom);
window.data = view.value;