/**
 * Created by richard.livingston on 18/02/2017.
 */
'use strict';

var util = require('util'),
	EE = require('events').EventEmitter;


module.exports = JSONView;
util.inherits(JSONView, EE);


function JSONView(name_, value_, parent_, isRoot_){
	var self = this;

	if (typeof isRoot_ === 'undefined' && arguments.length < 4) {
		isRoot_ = true;
	}

	EE.call(self);

	if(arguments.length < 2){
		value_ = name_;
		name_ = undefined;
	}

	var name, value, type,
		domEventListeners = [], children = [], expanded = false,
		edittingName = false, edittingValue = false,
		nameEditable = true, valueEditable = true;

	var dom = {
		container : document.createElement('div'),
		collapseExpand : document.createElement('div'),
		name : document.createElement('div'),
		separator : document.createElement('div'),
		value : document.createElement('div'),
		delete : document.createElement('div'),
		children : document.createElement('div'),
		insert : document.createElement('div')
	};


	Object.defineProperties(self, {

		dom : {
			value : dom.container,
			enumerable : true
		},

		isRoot: {
			get : function(){
				return isRoot_;
			}
		},

		parent: {
			get: function() {
				return parent_;
			}
		},

		children: {
			get: function() {
				var result = null;
				if (type === 'array') {
					result = children;
				}
				else if (type === 'object') {
					result = {};
					children.forEach(function(e) {
						result[e.name] = e;
					});
				}
				return result;
			}
		},

		name : {
			get : function(){
				return name;
			},

			set : setName,
			enumerable : true
		},

		value : {
			get : function(){
				return value;
			},

			set : setValue,
			enumerable : true
		},

		type : {
			get : function(){
				return type;
			},

			enumerable : true
		},

		nameEditable : {
			get : function(){
				return nameEditable;
			},

			set : function(value){
				nameEditable = !!value;
			},

			enumerable : true
		},

		valueEditable : {
			get : function(){
				return valueEditable;
			},

			set : function(value){
				valueEditable = !!value;
			},

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
		},

		destroy : {
			value : destroy,
			enumerable : true
		},

		editName : {
			value : editField.bind(null, 'name'),
			enumerable : true
		},

		editValue : {
			value : editField.bind(null, 'value'),
			enumerable : true
		}

	});


	Object.keys(dom).forEach(function(k){
		if (k === 'delete' && self.isRoot) {
			return;
		}

		var element = dom[k];

		if(k == 'container'){
			return;
		}

		element.className = k;
		dom.container.appendChild(element);
	});

	dom.container.className = 'jsonView';

	addDomEventListener(dom.collapseExpand, 'click', onCollapseExpandClick);
	addDomEventListener(dom.value, 'click', expand.bind(null, false));
	addDomEventListener(dom.name, 'click', expand.bind(null, false));

	addDomEventListener(dom.name, 'dblclick', editField.bind(null, 'name'));
	addDomEventListener(dom.name, 'blur', editFieldStop.bind(null, 'name'));
	addDomEventListener(dom.name, 'keypress', editFieldKeyPressed.bind(null, 'name'));
	addDomEventListener(dom.name, 'keydown', editFieldTabPressed.bind(null, 'name'));

	addDomEventListener(dom.value, 'dblclick', editField.bind(null, 'value'));
	addDomEventListener(dom.value, 'blur', editFieldStop.bind(null, 'value'));
	addDomEventListener(dom.value, 'keypress', editFieldKeyPressed.bind(null, 'value'));
	addDomEventListener(dom.value, 'keydown', editFieldTabPressed.bind(null, 'value'));
	addDomEventListener(dom.value, 'keydown', numericValueKeyDown);

	addDomEventListener(dom.insert, 'click', onInsertClick);
	addDomEventListener(dom.delete, 'click', onDeleteClick);

	setName(name_);
	setValue(value_);


	function refresh(){
		var expandable = type == 'object' || type == 'array';

		children.forEach(function(child){
			child.refresh();
		});

		dom.collapseExpand.style.display = expandable ? '' : 'none';

		if(expanded && expandable){
			expand();
		}
		else{
			collapse();
		}
	}


	function collapse(recursive){
		if(recursive){
			children.forEach(function(child){
				child.collapse(true);
			});
		}

		expanded = false;

		dom.children.style.display = 'none';
		dom.collapseExpand.className = 'expand';
		dom.container.classList.add('collapsed');
		dom.container.classList.remove('expanded');
	}


	function expand(recursive){
		var keys;

		if(type == 'object'){
			keys = Object.keys(value);
		}
		else if(type == 'array'){
			keys = value.map(function(v, k){
				return k;
			});
		}
		else{
			keys = [];
		}

		// Remove children that no longer exist
		for(var i = children.length - 1; i >= 0; i --){
			var child = children[i];

			if(keys.indexOf(child.name) == -1){
				children.splice(i, 1);
				removeChild(child);
			}
		}

		if(type != 'object' && type != 'array'){
			return collapse();
		}

		keys.forEach(function(key){
			addChild(key, value[key]);
		});

		if(recursive){
			children.forEach(function(child){
				child.expand(true);
			});
		}

		expanded = true;
		dom.children.style.display = '';
		dom.collapseExpand.className = 'collapse';
		dom.container.classList.add('expanded');
		dom.container.classList.remove('collapsed');
	}


	function destroy(){
		var child, event;

		while(event = domEventListeners.pop()){
			event.element.removeEventListener(event.name, event.fn);
		}

		while(child = children.pop()){
			removeChild(child);
		}
	}


	function setName(newName){
		var nameType = typeof newName,
			oldName = name;

		if(newName === name){
			return;
		}

		if(nameType != 'string' && nameType != 'number'){
			throw new Error('Name must be either string or number, ' + newName);
		}

		dom.name.innerText = newName;
		name = newName;
		self.emit('rename', self, name, oldName, newName, true);
	}


	function setValue(newValue){
		var oldValue = value,
			str;

		type = getType(newValue);

		switch(type){
			case 'null':
				str = 'null';
				break;
			case 'undefined':
				str = 'undefined';
				break;
			case 'object':
				str = 'Object[' + Object.keys(newValue).length + ']';
				break;

			case 'array':
				str = 'Array[' + newValue.length + ']';
				break;

			default:
				str = newValue;
				break;
		}

		dom.value.innerText = str;
		dom.value.className = 'value ' + type;

		if(newValue === value){
			return;
		}

		value = newValue;

		if(type == 'array' || type == 'object'){
			// Cannot edit objects as string because the formatting is too messy
			// Would have to either pass as JSON and force user to wrap properties in quotes
			// Or first JSON stringify the input before passing, this could allow users to reference globals

			// Instead the user can modify individual properties, or just delete the object and start again
			valueEditable = false;

			if(type == 'array'){
				// Obviously cannot modify array keys
				nameEditable = false;
			}
		}

		refresh();
		self.emit('change', self, name, oldValue, newValue);
	}


	function addChild(key, val){
		var child;

		for(var i = 0, len = children.length; i < len; i ++){
			if(children[i].name == key){
				child = children[i];
				break;
			}
		}

		if(child){
			child.value = val;
		}
		else{
			child = new JSONView(key, val, self, false);
			child.on('rename', onChildRename);
			child.on('delete', onChildDelete);
			child.on('change', onChildChange);
			child.on('append', onChildAppend);
			children.push(child);
		}

		dom.children.appendChild(child.dom);

		return child;
	}


	function removeChild(child){
		if(child.dom.parentNode){
			dom.children.removeChild(child.dom);
		}

		child.destroy();
		child.removeAllListeners();
	}


	function editField(field){
		if(parent_ && parent_.type == 'array'){
				// Obviously cannot modify array keys
				nameEditable = false;
			}
		var editable = field == 'name' ? nameEditable : valueEditable,
			element = dom[field];

		if(!editable && (parent_ && parent_.type === 'array')){
			if (!parent_.inserting) {
			//throw new Error('Cannot edit an array index.');
			return;
			}
		}

		if(field == 'value' && type == 'string'){
			element.innerText = '"' + value + '"';
		}

		if(field == 'name'){
			edittingName = true;
		}

		if(field == 'value'){
			edittingValue = true;
		}

		element.classList.add('edit');
		element.setAttribute('contenteditable', true);
		element.focus();
		document.execCommand('selectAll', false, null);
	}


	function editFieldStop(field){
		var element = dom[field];
		
		if(field == 'name'){
			if(!edittingName){
				return;
			}
			edittingName = false;
		}

		if(field == 'value'){
			if(!edittingValue){
				return;
			}
			edittingValue = false;
		}
		
		if(field == 'name'){
			var p = self.parent;
			var edittingNameText = element.innerText;
			if (p && p.type === 'object' && edittingNameText in p.value) {
				element.innerText = name;
				element.classList.remove('edit');
				element.removeAttribute('contenteditable');
				//throw new Error('Name exist, ' + edittingNameText);
			}
			else {
				setName.call(self, edittingNameText);
			}
		}
		else{
			var text = element.innerText;
			try{
				setValue(text === 'undefined' ? undefined : JSON.parse(text));
			}
			catch(err){
				setValue(text);
			}
		}

		element.classList.remove('edit');
		element.removeAttribute('contenteditable');
	}


	function editFieldKeyPressed(field, e){
		switch(e.key){
			case 'Escape':
			case 'Enter':
				editFieldStop(field);
				break;
		}
	}


	function editFieldTabPressed(field, e){
		if(e.key == 'Tab'){
			editFieldStop(field);

			if(field == 'name'){
				e.preventDefault();
				editField('value');
			}
			else{
				editFieldStop(field);
			}
		}
	}


	function numericValueKeyDown(e){
		var increment = 0, currentValue;

		if(type != 'number'){
			return;
		}

		switch(e.key){
			case 'ArrowDown':
			case 'Down':
				increment = -1;
				break;

			case 'ArrowUp':
			case 'Up':
				increment = 1;
				break;
		}

		if(e.shiftKey){
			increment *= 10;
		}

		if(e.ctrlKey || e.metaKey){
			increment /= 10;
		}

		if(increment){
			currentValue = parseFloat(dom.value.innerText);

			if(!isNaN(currentValue)){
				setValue(Number((currentValue + increment).toFixed(10)));
			}
		}
	}


	function getType(value){
		var type = typeof value;

		if(type == 'object'){
			if(value === null){
				return 'null';
			}

			if(Array.isArray(value)){
				return 'array';
			}
		}
		if (type === 'undefined') {
			return 'undefined';
		}

		return type;
	}


	function onCollapseExpandClick(){
		if(expanded){
			collapse();
		}
		else{
			expand();
		}
	}


	function onInsertClick(){
		var newName = type == 'array' ? value.length : undefined,
			child = addChild(newName, null);
		if (child.parent) {
			child.parent.inserting = true;
		}
		if(type == 'array'){
			value.push(null);
			child.editValue();
			child.emit('append', self, value.length - 1, 'value', null);
			if (child.parent) {
				child.parent.inserting = false;
			}
		}
		else{
			child.editName();
		}
	}


	function onDeleteClick(){
		self.emit('delete', self, self.name);
	}


	function onChildRename(child, keyPath, oldName, newName, original){
		var allow = newName && type != 'array' && !(newName in value) && original;
		if(allow){
			value[newName] = child.value;
			delete value[oldName];
			if (self.inserting) {
				child.emit('append', self, newName, 'name', newName);
				self.inserting = false;
				return;
			}
		}
		else if(oldName === undefined){
			// A new node inserted via the UI
			original && removeChild(child);
		}
		else if (original){
			// Cannot rename array keys, or duplicate object key names
			child.name = oldName;
			return;
		}
		//value[keyPath] = newName;

		// child.once('rename', onChildRename);
		var newKeyPath = child === self ? keyPath : name + '.' + keyPath;
		self.emit('rename', self, newKeyPath, oldName, newName, false);
	}


	function onChildAppend(child, keyPath, nameOrValue, newValue){
		self.emit('append', self, name + '.' + keyPath, nameOrValue, newValue);
	}


	function onChildChange(child, keyPath, oldValue, newValue, recursed){
		if(!recursed){
			value[keyPath] = newValue;
		}

		self.emit('change', self, name + '.' + keyPath, oldValue, newValue, true);
	}


	function onChildDelete(child, keyPath){
		var key = child.name;

		if(type == 'array'){
			value.splice(key, 1);
		}
		else{
			delete value[key];
		}

		refresh();
		self.emit('delete', child, name + '.' + keyPath);
	}


	function addDomEventListener(element, name, fn){
		element.addEventListener(name, fn);
		domEventListeners.push({element : element, name : name, fn : fn});
	}
}