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
view.withRootName = false;

view.on('change', function(self, key, oldValue, newValue){
    console.log('change', key, oldValue, '=>', newValue, self);
});
view.on('rename', function(self, key, oldName, newName) {
    console.log('rename', key, oldName, '=>', newName, self);
});
view.on('delete', function(self, key, value, parentType) {
    console.log('delete', key, '=', value, parentType, self);
});
view.on('append', function(self, key, nameOrValue, newValue) {
    console.log('append', key, nameOrValue, '=>', newValue, self);
});
view.on('click', function(self, key, value) {
    console.log('click', key, '=', value, self);
});
view.on('expand', function(self, key, value) {
    console.log('expand', key, '=', value, self);
});
view.on('collapse', function(self, key, value) {
    console.log('collapse', key, '=', value, self);
});
view.on('refresh', function(self, key, value) {
    console.log('refresh', key, '=', value, self);
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
