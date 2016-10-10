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

    var name, value, type, editable;

    var containerDiv = document.createElement('div'),
        nameDiv = document.createElement('div'),
        separatorDiv = document.createElement('div'),
        valueDiv = document.createElement('div'),
        childrenDiv = document.createElement('div');

    containerDiv.appendChild(nameDiv);
    containerDiv.appendChild(separatorDiv);
    containerDiv.appendChild(valueDiv);
    containerDiv.appendChild(childrenDiv);

    containerDiv.className = 'jsonView';
    nameDiv.className = 'name';
    separatorDiv.className = 'separator';
    valueDiv.className = 'value';
    childrenDiv.className = 'children';

    separatorDiv.innerText = ':';


    Object.defineProperties(self, {

        name : {
            get : function(){
                return name;
            },
            set : function(value){
                name = value;
                nameDiv.innerText = name;
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
                self.emit('change');
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
                    editStop();
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

        collapse : {
            value : collapse,
            enumerable : true
        },

        expand : {
            value : expand,
            enumerable : true
        }

    });


    opts = opts || {};

    self.name = opts.name;
    self.value = opts.value;
    self.editable = 'editable' in opts ? !!opts.editable : true;

    nameDiv.addEventListener('click', toggleCollapse);
    valueDiv.addEventListener('click', toggleCollapse);
    valueDiv.addEventListener('dblclick', edit);
    valueDiv.addEventListener('blur', editStop);
    valueDiv.addEventListener('keydown', editOnKey);


    function refresh(){
        while(childrenDiv.firstChild){
            childrenDiv.removeChild(childrenDiv.firstChild);
        }

        switch(type){
            case 'object':
            case 'array':
                valueDiv.innerText = type == 'object' ? 'Object' : 'Array[' + value.length + ']';

                Object.keys(value).forEach(function(k) {
                    var view;

                    try {
                        view = new JSONView({
                            name: k,
                            value: value[k]
                        });

                        view.on('change', function(){
                            value[k] = view.value;
                        });
                    }
                    catch (err) {
                        return;
                    }

                    childrenDiv.appendChild(view.dom);
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


    function collapse(){
        containerDiv.classList.remove('expanded');
        containerDiv.classList.add('collapsed');
    }


    function expand(){
        containerDiv.classList.remove('collapsed');
        containerDiv.classList.add('expanded');
    }


    function toggleCollapse(){
        containerDiv.classList.toggle('collapsed');
        containerDiv.classList.toggle('expanded');
    }


    function edit(){
        if(!editable || valueDiv.classList.contains('edit')){
            return;
        }

        collapse();
        valueDiv.classList.add('edit');
        valueDiv.setAttribute('contenteditable', true);
        valueDiv.focus();
        document.execCommand('selectAll', false, null);
    }


    function editStop(){
        valueDiv.classList.remove('edit');
        valueDiv.removeAttribute('contenteditable');

        try{
            self.value = parse(valueDiv.innerText);
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


    function editOnKey(event){
        var enter = 13,
            up = 38,
            down = 40,
            newValue;

        if([enter, down, up].indexOf(event.keyCode)== -1){
            return;
        }

        if(type == 'number' && enter != event.keyCode){
            newValue = Number(valueDiv.innerText) + (down == event.keyCode ? -1 : 1);

            if(!isNaN(newValue)){
                valueDiv.innerText = newValue;
                return;
            }
        }

        valueDiv.blur();
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
