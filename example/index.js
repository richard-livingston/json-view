/**
 * Created by r1ch4 on 02/10/2016.
 */

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
}, null);


view.expand(true);
view.withRootName = true;

view.on('change', function(self, keyPath, oldValue, newValue){
    console.log('change', keyPath, oldValue, '=>', newValue);
});
view.on('rename', function (self, keyPath, oldName, newName) {
    console.log('rename', keyPath, oldName, '=>', newName);
});
view.on('delete', function (self, keyPath, value, parentType) {
    console.log('delete', keyPath, '=>', value, parentType);
});
view.on('append', function (self, keyPath, nameOrValue, newValue) {
    console.log('append', keyPath, nameOrValue, '=>', newValue);
});
view.on('click', function (self, keyPath, value) {
    console.log('click', keyPath, '=>', value);
});
view.on('expand', function (self, keyPath, value) {
    console.log('expand', keyPath, '=>', value);
});
view.on('collapse', function (self, keyPath, value) {
    console.log('collapse', keyPath, '=>', value);
});
view.on('refresh', function (self, keyPath, value) {
    console.log('refresh', keyPath, '=>', value);
});

document.body.appendChild(view.dom);
window.view = view;

view.value.f.pop()
view.value.f.push(9)
view.value.e.a = 'aaa';
view.value.e.d = 'ddd';
delete view.value.c;
view.refresh();

/*
view.alwaysShowRoot = true;
view.readonlyWhenFiltering = true;
view.filterText = 'a';

view.filterText = null;

view.readonly = true;
*/

document.getElementById('filter').addEventListener('input', function() {
    view.filterText = this.value;
});
document.getElementById('root').addEventListener('change', function() {
    view.alwaysShowRoot = !!this.checked;
});
document.getElementById('rowf').addEventListener('change', function() {
    view.readonlyWhenFiltering = !!this.checked;
});
document.getElementById('ro').addEventListener('change', function() {
    view.readonly = !!this.checked;
});
document.getElementById('sc').addEventListener('change', function () {
    view.showCountOfObjectOrArray = !!this.checked;
});
document.getElementById('wr').addEventListener('change', function () {
    view.withRootName = !!this.checked;
});
