/**
 * Created by r1ch4 on 01/10/2016.
 */

'use strict'


var util = require('util'),
    EE = require('events').EventEmitter;


util.inherits(JSONView, EE);
module.exports = JSONView;


function JSONView(opts){
    EE.call(this);
    var self = this;

    var name, value, type, editable, children = [];

    var containerDiv = document.createElement('div'),
        nameDiv = document.createElement('div'),
        separatorDiv = document.createElement('div'),
        valueDiv = document.createElement('div'),
        childrenDiv = document.createElement('div'),
        removeDiv = document.createElement('div'),
        insertDiv = document.createElement('div');

    containerDiv.appendChild(nameDiv);
    containerDiv.appendChild(separatorDiv);
    containerDiv.appendChild(valueDiv);
    containerDiv.appendChild(removeDiv);
    containerDiv.appendChild(childrenDiv);
    containerDiv.appendChild(insertDiv);

    containerDiv.className = 'jsonView';
    nameDiv.className = 'name';
    separatorDiv.className = 'separator';
    valueDiv.className = 'value';
    childrenDiv.className = 'children';
    removeDiv.className = 'remove';
    insertDiv.className = 'insert';

    separatorDiv.innerText = ':';
    removeDiv.innerText = '✕';
    insertDiv.innerText = '+';


    Object.defineProperties(self, {

        name : {
            get : function(){
                return name;
            },
            set : function(value){
                name = value;
                nameDiv.innerText = name;
                self.emit('change', name, value);
            },
            enumerable : true
        },

        value : {
            get : function(){
                return value;
            },
            set : function(_value){
                if(value === _value){
                    return;
                }

                if(type){
                    containerDiv.classList.remove(type);
                }
                type = getType(_value);

                containerDiv.classList.add(type);
                value = _value;
                refresh();
                self.emit('change', name, value);
            },
            enumerable : true
        },

        type : {
            get : function(){
                return type;
            },
            enumerable : true
        },

        editable : {
            get : function(){
                return editable;
            },
            set : function(value){
                editable = !!value;

                if(!editable){
                    editNameStop();
                    editValueStop();
                }
            },
            enumerable : true
        },

        dom : {
            value : containerDiv,
            enumerable : true
        },

        refresh : {
            value : refresh,
            enumerable : true
        },

        remove : {
            value : remove,
            enumerable : true
        },

        collapse : {
            value : collapse,
            enumerable : true
        },

        expand : {
            value : expand,
            enumerable : true
        },

        editName : {
            value : editName,
            enumerable : true
        }

    });


    opts = opts || {};

    self.name = opts.name;
    self.value = opts.value;
    self.editable = 'editable' in opts ? !!opts.editable : true;

    nameDiv.addEventListener('click', toggleCollapse);
    nameDiv.addEventListener('dblclick', editName);
    nameDiv.addEventListener('blur', editNameStop);
    nameDiv.addEventListener('keydown', editNameOnKey);

    valueDiv.addEventListener('click', toggleCollapse);
    valueDiv.addEventListener('dblclick', editValue);
    valueDiv.addEventListener('blur', editValueStop);
    valueDiv.addEventListener('keydown', editValueOnKey);

    removeDiv.addEventListener('click', remove);
    insertDiv.addEventListener('click', insertNewChild);


    function refresh(){
        removeChildren();

        switch(type){
            case 'object':
            case 'array':
                valueDiv.innerText = type == 'object' ? 'Object' : 'Array[' + value.length + ']';

                Object.keys(value).forEach(function(k) {
                    insertChild(k, value[k]);
                });
                break;

            case 'null':
                valueDiv.innerText = 'null';
                break;

            default:
                valueDiv.innerText = value;
                break;
        }

        expand();
    }


    function insertNewChild(){
        var child;

        if(type == 'array'){
            child = insertChild(value.length, null);
            child.editable = false;
        }
        else{
            child = insertChild('', null);

            if(child){
                child.editName();
            }
        }
    }


    function insertChild(childName, childValue){
        var child;

        try {
            child = new JSONView({
                name: childName,
                value: childValue
            });

            child.on('change', function(keyPath, newValue, recursed){
                if(!recursed && child.name in value){
                    value[child.name] = newValue;
                }

                self.emit('change', name + '.' + keyPath, newValue, true);
            });

            child.on('rename', function(oldName, newName){
                if(newName in value || newName == ''){
                    child.name = oldName;

                    if(oldName == ''){
                        child.remove();
                    }
                }
                else{
                    child.name = newName;
                    value[newName] = child.value;
                    deleteKey(oldName);
                }
            });

            child.once('remove', function(){
                deleteKey(child.name);
                self.emit('change', name, value);
            });

            childrenDiv.appendChild(child.dom);
            children.push(child);

            if(childName != ''){
                value[childName] = childValue;
            }
        }
        catch (err) {
            return;
        }

        return child;


        function deleteKey(key){
            var numericKey;

            if(type == 'object'){
                delete value[key];
            }
            else if(type == 'array' && !isNaN(key)){
                numericKey = Number(key);

                if(String(numericKey) === String(key)){
                    value.splice(key, 1);
                }
            }

            refresh();
        }
    }


    function remove(){
        self.emit('remove');
        removeChildren();
    }


    function removeChildren(){
        var child;

        while(children.length){
            child = children.pop();
            child.removeAllListeners();
            childrenDiv.removeChild(child.dom);
        }
    }


    function collapse(recursive){
        containerDiv.classList.remove('expanded');
        containerDiv.classList.add('collapsed');

        if(recursive){
            children.forEach(function(child){
                child.collapse(true);
            });
        }
    }


    function expand(recursive){
        containerDiv.classList.remove('collapsed');
        containerDiv.classList.add('expanded');

        if(recursive){
            children.forEach(function(child){
                child.expand(true);
            });
        }
    }


    function toggleCollapse(){
        containerDiv.classList.toggle('collapsed');
        containerDiv.classList.toggle('expanded');
    }


    function editName(){
        editDiv(nameDiv);
    }


    function editNameStop(){
        var oldName = name,
            newName = nameDiv.innerText;

        nameDiv.classList.remove('edit');
        nameDiv.removeAttribute('contenteditable');

        if(newName == oldName && newName != ''){
            return;
        }

        name = newName;
        self.emit('rename', oldName, newName);
    }


    function editNameOnKey(event){
        var enter = 13,
            tab = 9;

        switch(event.keyCode){
            case enter:
                nameDiv.blur();
                break;

            case tab:
                editDiv(valueDiv);
                event.preventDefault();
                break;
        }
    }


    function editValue(){
        editDiv(valueDiv);
    }


    function editValueStop(){
        var newValue;

        valueDiv.classList.remove('edit');
        valueDiv.removeAttribute('contenteditable');

        try{
            newValue = parse(valueDiv.innerText);

            if(value === newValue){
                refresh();
            }
            else{
                self.value = newValue;
            }
        }
        catch(err){
            refresh();
        }

        expand();


        // TODO - Think of another way to do this, user can't reference globals, but can still run code in here
        function parse(){
            var globals = Object.keys(window);

            return (new Function(globals.join(','), '"use strict"; return JSON.parse(JSON.stringify(' + valueDiv.innerText + '));'))
                .bind(undefined, new Array(globals.length))
                ();
        }
    }


    function editValueOnKey(event){
        var enter = 13,
            up = 38,
            down = 40,
            newValue;

        if([enter, down, up].indexOf(event.keyCode)== -1){
            return;
        }

        if(type == 'number' && enter != event.keyCode){
            newValue = Number(valueDiv.innerText) + ((down == event.keyCode ? -1 : 1) * (event.shiftKey ? 10 : 1));

            if(!isNaN(newValue)){
                self.value = newValue;
                return;
            }
        }

        valueDiv.blur();
    }


    function editDiv(div){
        if(!editable || div.classList.contains('edit')){
            return;
        }

        collapse();
        div.classList.add('edit');
        div.setAttribute('contenteditable', true);
        div.focus();
        document.execCommand('selectAll', false, null);
    }


    function getType(value){
        var t;

        if(value == null){
            return 'null';
        }

        if(Array.isArray(value)){
            return 'array';
        }

        t = typeof value;

        switch(t){
            case 'boolean':
            case 'number':
            case 'string':
            case 'array':
            case 'object':
                return t;

            default:
                throw new Error('"' + t + '" is not a valid JSON type');
        }
    }
}
