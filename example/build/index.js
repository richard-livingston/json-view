(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"json-tree-view":3}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
/**
 * Created by richard.livingston on 18/02/2017.
 */
'use strict';

var util = require('util'),
	EE = require('events').EventEmitter;


module.exports = JSONTreeView;
util.inherits(JSONTreeView, EE);


function JSONTreeView(name_, value_, parent_, isRoot_){
	var self = this;

	if (typeof isRoot_ === 'undefined' && arguments.length < 4) {
		isRoot_ = true;
	}

	EE.call(self);

	if(arguments.length < 2){
		value_ = name_;
		name_ = undefined;
	}

	var name, value, type, filterText = '', hidden = false, readonly = false,
		readonlyWhenFiltering = false, alwaysShowRoot = false,
		includingRootName = true,
		domEventListeners = [], children = [], expanded = false,
		edittingName = false, edittingValue = false,
		nameEditable = true, valueEditable = true;

	var dom = {
		container : document.createElement('div'),
		collapseExpand : document.createElement('div'),
		name : document.createElement('div'),
		separator : document.createElement('div'),
		value : document.createElement('div'),
		spacing: document.createElement('div'),
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

		readonly: {
			get: function() {
				return !!(readonly & 1);
			},
			set: function(ro) {
				readonly = setBit(readonly, 0, +ro);
				!!(readonly & 1) ? dom.container.classList.add('readonly')
						: dom.container.classList.remove('readonly');
				for (var i in children) {
					children[i].readonly = setBit(readonly, 0, +ro);
				}
			}
		},

		readonlyWhenFiltering: {
			get: function() {
				return readonlyWhenFiltering;
			},
			set: function(rowf) {
				readonly = setBit(readonly, 1, +rowf);
				readonlyWhenFiltering = rowf;
				(readonly && this.filterText) || !!(readonly & 1)
						? dom.container.classList.add('readonly')
								: dom.container.classList.remove('readonly');
				for (var i in children) {
					children[i].readonly = setBit(readonly, 1, +rowf);
					children[i].readonlyWhenFiltering = rowf;
				}
			}
		},

		hidden: {
			get: function() {
				return hidden;
			},
			set: function(h) {
				hidden = h;
				h ? dom.container.classList.add('hidden')
						: dom.container.classList.remove('hidden');
				if (!h) {
					parent_ && (parent_.hidden = h);
				}
			}
		},

		filterText: {
			get: function() {
				return filterText;
			},
			set: function(text) {
				filterText = text;
				if (text) {
					if (readonly > 0) {
						dom.container.classList.add('readonly');
					}
					var key = this.name + '';
					var value = this.value + '';
					if (key.indexOf(text) > -1 || value.indexOf(text) > -1) {
						this.hidden = false;
					} else {
						if (!this.alwaysShowRoot || !isRoot_) {
							this.hidden = true;
						}
					}
				} else {
					!this.readonly && dom.container.classList.remove('readonly');
					this.hidden = false;
				}
				for (var i in children) {
					children[i].filterText = text;
				}
			}
		},

		alwaysShowRoot: {
			get: function() {
				return alwaysShowRoot;
			},
			set: function(value) {
				if (isRoot_ && this.filterText) {
					this.hidden = !value;
				}
				alwaysShowRoot = value;
				for (var i in children) {
					children[i].alwaysShowRoot = value;
				}
			}
		},

		withRootName: {
			get: function() {
				return includingRootName;
			},
			set: function(value) {
				includingRootName = value;
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
		if (['name', 'separator', 'value', 'spacing'].indexOf(k) > -1) {
			element.className += ' item';
		}
		dom.container.appendChild(element);
	});

	dom.container.className = 'jsonView';

	addDomEventListener(dom.collapseExpand, 'click', onCollapseExpandClick);
	addDomEventListener(dom.value, 'click', expand.bind(null, false));
	addDomEventListener(dom.name, 'click', expand.bind(null, false));

	addDomEventListener(dom.name, 'dblclick', editField.bind(null, 'name'));
	addDomEventListener(dom.name, 'click', itemClicked.bind(null, 'name'));
	addDomEventListener(dom.name, 'blur', editFieldStop.bind(null, 'name'));
	addDomEventListener(dom.name, 'keypress',
			editFieldKeyPressed.bind(null, 'name'));
	addDomEventListener(dom.name, 'keydown',
			editFieldTabPressed.bind(null, 'name'));

	addDomEventListener(dom.value, 'dblclick', editField.bind(null, 'value'));
	addDomEventListener(dom.value, 'click', itemClicked.bind(null, 'value'));
	addDomEventListener(dom.value, 'blur', editFieldStop.bind(null, 'value'));
	addDomEventListener(dom.value, 'keypress',
			editFieldKeyPressed.bind(null, 'value'));
	addDomEventListener(dom.value, 'keydown',
			editFieldTabPressed.bind(null, 'value'));
	addDomEventListener(dom.value, 'keydown', numericValueKeyDown);

	addDomEventListener(dom.insert, 'click', onInsertClick);
	addDomEventListener(dom.delete, 'click', onDeleteClick);

	setName(name_);
	setValue(value_);

	function setBit(n, i, b) {
		var j = 0;
		while ((n >> j << j)) {
			j++;
		}
		return i >= j
				? (n | +b << i )
						: (n >> (i + 1) << (i + 1)) | (n % (n >> i << i)) | (+b << i);
	}


	function squarebracketify(exp) {
		return typeof exp === 'string'
			? exp.replace(/\.([0-9]+)/g, '[$1]') : exp + '';
	}

	function refresh(noEmitting){
		var expandable = type == 'object' || type == 'array';

		children.forEach(function(child){
			child.refresh(true);
		});

		dom.collapseExpand.style.display = expandable ? '' : 'none';

		if(expanded && expandable){
			expand(false, noEmitting);
		}
		else{
			collapse(false, noEmitting);
		}
		!noEmitting && self.emit('refresh', self, self.name, self.value);
	}


	function collapse(recursive, noEmitting){
		if(recursive){
			children.forEach(function(child){
				child.collapse(true, true);
			});
		}

		expanded = false;

		dom.children.style.display = 'none';
		dom.collapseExpand.className = 'expand';
		dom.container.classList.add('collapsed');
		dom.container.classList.remove('expanded');
		!noEmitting && (type == 'object' || type == 'array')
			&& self.emit('collapse', self, self.name, self.value);
	}


	function expand(recursive, noEmitting){
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
				removeChild(child, noEmitting);
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
				child.expand(true, true);
			});
		}

		expanded = true;
		dom.children.style.display = '';
		dom.collapseExpand.className = 'collapse';
		dom.container.classList.add('expanded');
		dom.container.classList.remove('collapsed');
		!noEmitting && (type == 'object' || type == 'array')
			&& self.emit('expand', self, self.name, self.value);
	}


	function destroy(){
		var child, event;

		while(event = domEventListeners.pop()){
			event.element.removeEventListener(event.name, event.fn);
		}

		while(child = children.pop()){
			removeChild(child, true);
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
		dom.value.className = 'value item ' + type;

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

		self.emit('change', self, name, oldValue, newValue);
		refresh();
	}


	function updateObjectChildCount() {
		var str;
		if (type === 'object') {
			str = 'Object[' + Object.keys(value).length + ']';
		}
		if (type === 'array') {
			str = 'Array[' + value.length + ']';
		}
		dom.value.innerText = str;
	}


	function addChild(key, val, noEmitting){
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
			child = new JSONTreeView(key, val, self, false);
			child.on('rename', onChildRename);
			child.on('delete', onChildDelete);
			child.on('change', onChildChange);
			child.on('append', onChildAppend);
			child.on('click', onChildClick);
			child.on('expand', onChildExpand);
			child.on('collapse', onChildCollapse);
			child.on('refresh', onChildRefresh);
			children.push(child);
			if (!noEmitting) {
				child.emit('append', child, key, 'value', val, true);
			}
		}

		dom.children.appendChild(child.dom);

		return child;
	}


	function removeChild(child, noEmitting){
		if(child.dom.parentNode){
			dom.children.removeChild(child.dom);
		}

		if (!noEmitting && child && child.name !== '') {
			child.emit('delete', child, child.name, child.value, child.parent.type,
				true);
		}
		child.destroy();
		child.removeAllListeners();
	}


	function editField(field){
		if((readonly > 0 && filterText) || !!(readonly & 1)) {
			return;
		}
		if(field === 'value' && (type === 'object' || type === 'array')){
			return;
		}
		if(parent_ && parent_.type == 'array'){
			// Obviously cannot modify array keys
			nameEditable = false;
		}
		var editable = field == 'name' ? nameEditable : valueEditable,
			element = dom[field];

		if(!editable && (parent_ && parent_.type === 'array')){
			if (!parent_.inserting) {
				// throw new Error('Cannot edit an array index.');
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


	function itemClicked(field) {
		self.emit('click', self,
			!self.withRootName && self.isRoot ? '' : self.name, self.value);
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
				// throw new Error('Name exist, ' + edittingNameText);
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
			child = addChild(newName, null, true);
		if (child.parent) {
			child.parent.inserting = true;
		}
		if(type == 'array'){
			value.push(null);
			child.editValue();
			child.emit('append', self, value.length - 1, 'value', null, true);
			if (child.parent) {
				child.parent.inserting = false;
			}
		}
		else{
			child.editName();
		}
	}


	function onDeleteClick(){
		self.emit('delete', self, self.name, self.value, self.parent.type, true);
	}


	function onChildRename(child, keyPath, oldName, newName, original){
		var allow = newName && type != 'array' && !(newName in value) && original;
		if(allow){
			value[newName] = child.value;
			delete value[oldName];
			if (self.inserting) {
				child.emit('append', child, newName, 'name', newName, true);
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
		// value[keyPath] = newName;

		// child.once('rename', onChildRename);
		var newKeyPath = child === self || (!self.withRootName && self.isRoot)
			? keyPath
			: name + '.' + keyPath;
		if (oldName !== undefined) {
			self.emit('rename', child, squarebracketify(newKeyPath), oldName, newName,
				false);
		}
	}


	function onChildAppend(child, keyPath, nameOrValue, newValue, sender){
		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('append', child, squarebracketify(newKeyPath), nameOrValue,
			newValue, false);
		sender && updateObjectChildCount();
	}


	function onChildChange(child, keyPath, oldValue, newValue, recursed){
		if(!recursed){
			value[keyPath] = newValue;
		}

		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('change', child, squarebracketify(newKeyPath), oldValue, newValue,
			true);
	}


	function onChildDelete(child, keyPath, deletedValue, parentType, sender){
		var key = child.name;

		if(type == 'array'){
			value.splice(key, 1);
		}
		else if (sender) {
			delete value[key];
		}

		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('delete', child, squarebracketify(newKeyPath), deletedValue,
			parentType, false);
		sender && updateObjectChildCount();
		refresh(true);
	}


	function onChildClick(child, keyPath, value) {
		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('click', child, squarebracketify(newKeyPath), value);
	}


	function onChildExpand(child, keyPath, value) {
		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('expand', child, squarebracketify(newKeyPath), value);
	}


	function onChildCollapse(child, keyPath, value) {
		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('collapse', child, squarebracketify(newKeyPath), value);
	}


	function onChildRefresh(child, keyPath, value) {
		var newKeyPath = !self.withRootName && self.isRoot
			? keyPath
			: name + '.' + keyPath;
		self.emit('refresh', child, squarebracketify(newKeyPath), value);
	}


	function addDomEventListener(element, name, fn){
		element.addEventListener(name, fn);
		domEventListeners.push({element : element, name : name, fn : fn});
	}
}
},{"events":2,"util":7}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":6,"_process":4,"inherits":5}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2pzb24tdHJlZS12aWV3L0pTT05WaWV3LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzkyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHIxY2g0IG9uIDAyLzEwLzIwMTYuXG4gKi9cblxudmFyIEpTT05UcmVlVmlldyA9IHJlcXVpcmUoJ2pzb24tdHJlZS12aWV3Jyk7XG5cbnZhciB2aWV3ID0gbmV3IEpTT05UcmVlVmlldygnZXhhbXBsZScsIHtcbiAgICBoZWxsbyA6ICd3b3JsZCcsXG4gICAgZG91YmxlQ2xpY2sgOiAnbWUgdG8gZWRpdCcsXG4gICAgYSA6IG51bGwsXG4gICAgYiA6IHRydWUsXG4gICAgYyA6IGZhbHNlLFxuICAgIGQgOiAxLFxuICAgIGUgOiB7bmVzdGVkIDogJ29iamVjdCd9LFxuICAgIGYgOiBbMSwyLDNdXG59LCBudWxsKTtcblxuXG52aWV3LmV4cGFuZCh0cnVlKTtcbnZpZXcud2l0aFJvb3ROYW1lID0gZmFsc2U7XG5cbnZpZXcub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHNlbGYsIGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKXtcbiAgICBjb25zb2xlLmxvZygnY2hhbmdlJywga2V5LCBvbGRWYWx1ZSwgJz0+JywgbmV3VmFsdWUsIHNlbGYpO1xufSk7XG52aWV3Lm9uKCdyZW5hbWUnLCBmdW5jdGlvbihzZWxmLCBrZXksIG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgICBjb25zb2xlLmxvZygncmVuYW1lJywga2V5LCBvbGROYW1lLCAnPT4nLCBuZXdOYW1lLCBzZWxmKTtcbn0pO1xudmlldy5vbignZGVsZXRlJywgZnVuY3Rpb24oc2VsZiwga2V5LCB2YWx1ZSwgcGFyZW50VHlwZSkge1xuICAgIGNvbnNvbGUubG9nKCdkZWxldGUnLCBrZXksICc9JywgdmFsdWUsIHBhcmVudFR5cGUsIHNlbGYpO1xufSk7XG52aWV3Lm9uKCdhcHBlbmQnLCBmdW5jdGlvbihzZWxmLCBrZXksIG5hbWVPclZhbHVlLCBuZXdWYWx1ZSkge1xuICAgIGNvbnNvbGUubG9nKCdhcHBlbmQnLCBrZXksIG5hbWVPclZhbHVlLCAnPT4nLCBuZXdWYWx1ZSwgc2VsZik7XG59KTtcbnZpZXcub24oJ2NsaWNrJywgZnVuY3Rpb24oc2VsZiwga2V5LCB2YWx1ZSkge1xuICAgIGNvbnNvbGUubG9nKCdjbGljaycsIGtleSwgJz0nLCB2YWx1ZSwgc2VsZik7XG59KTtcbnZpZXcub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKHNlbGYsIGtleSwgdmFsdWUpIHtcbiAgICBjb25zb2xlLmxvZygnZXhwYW5kJywga2V5LCAnPScsIHZhbHVlLCBzZWxmKTtcbn0pO1xudmlldy5vbignY29sbGFwc2UnLCBmdW5jdGlvbihzZWxmLCBrZXksIHZhbHVlKSB7XG4gICAgY29uc29sZS5sb2coJ2NvbGxhcHNlJywga2V5LCAnPScsIHZhbHVlLCBzZWxmKTtcbn0pO1xudmlldy5vbigncmVmcmVzaCcsIGZ1bmN0aW9uKHNlbGYsIGtleSwgdmFsdWUpIHtcbiAgICBjb25zb2xlLmxvZygncmVmcmVzaCcsIGtleSwgJz0nLCB2YWx1ZSwgc2VsZik7XG59KTtcblxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2aWV3LmRvbSk7XG53aW5kb3cudmlldyA9IHZpZXc7XG5cbnZpZXcudmFsdWUuZi5wb3AoKVxudmlldy52YWx1ZS5mLnB1c2goOSlcbnZpZXcudmFsdWUuZS5hID0gJ2FhYSc7XG52aWV3LnZhbHVlLmUuZCA9ICdkZGQnO1xuZGVsZXRlIHZpZXcudmFsdWUuYztcbnZpZXcucmVmcmVzaCgpO1xuXG4vKlxudmlldy5hbHdheXNTaG93Um9vdCA9IHRydWU7XG52aWV3LnJlYWRvbmx5V2hlbkZpbHRlcmluZyA9IHRydWU7XG52aWV3LmZpbHRlclRleHQgPSAnYSc7XG5cbnZpZXcuZmlsdGVyVGV4dCA9IG51bGw7XG5cbnZpZXcucmVhZG9ubHkgPSB0cnVlO1xuKi9cblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgdmlldy5maWx0ZXJUZXh0ID0gdGhpcy52YWx1ZTtcbn0pO1xuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICB2aWV3LmFsd2F5c1Nob3dSb290ID0gISF0aGlzLmNoZWNrZWQ7XG59KTtcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb3dmJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgdmlldy5yZWFkb25seVdoZW5GaWx0ZXJpbmcgPSAhIXRoaXMuY2hlY2tlZDtcbn0pO1xuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JvJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgdmlldy5yZWFkb25seSA9ICEhdGhpcy5jaGVja2VkO1xufSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgcmljaGFyZC5saXZpbmdzdG9uIG9uIDE4LzAyLzIwMTcuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyksXG5cdEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSlNPTlRyZWVWaWV3O1xudXRpbC5pbmhlcml0cyhKU09OVHJlZVZpZXcsIEVFKTtcblxuXG5mdW5jdGlvbiBKU09OVHJlZVZpZXcobmFtZV8sIHZhbHVlXywgcGFyZW50XywgaXNSb290Xyl7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHRpZiAodHlwZW9mIGlzUm9vdF8gPT09ICd1bmRlZmluZWQnICYmIGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG5cdFx0aXNSb290XyA9IHRydWU7XG5cdH1cblxuXHRFRS5jYWxsKHNlbGYpO1xuXG5cdGlmKGFyZ3VtZW50cy5sZW5ndGggPCAyKXtcblx0XHR2YWx1ZV8gPSBuYW1lXztcblx0XHRuYW1lXyA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdHZhciBuYW1lLCB2YWx1ZSwgdHlwZSwgZmlsdGVyVGV4dCA9ICcnLCBoaWRkZW4gPSBmYWxzZSwgcmVhZG9ubHkgPSBmYWxzZSxcblx0XHRyZWFkb25seVdoZW5GaWx0ZXJpbmcgPSBmYWxzZSwgYWx3YXlzU2hvd1Jvb3QgPSBmYWxzZSxcblx0XHRpbmNsdWRpbmdSb290TmFtZSA9IHRydWUsXG5cdFx0ZG9tRXZlbnRMaXN0ZW5lcnMgPSBbXSwgY2hpbGRyZW4gPSBbXSwgZXhwYW5kZWQgPSBmYWxzZSxcblx0XHRlZGl0dGluZ05hbWUgPSBmYWxzZSwgZWRpdHRpbmdWYWx1ZSA9IGZhbHNlLFxuXHRcdG5hbWVFZGl0YWJsZSA9IHRydWUsIHZhbHVlRWRpdGFibGUgPSB0cnVlO1xuXG5cdHZhciBkb20gPSB7XG5cdFx0Y29udGFpbmVyIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cdFx0Y29sbGFwc2VFeHBhbmQgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRuYW1lIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cdFx0c2VwYXJhdG9yIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cdFx0dmFsdWUgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRzcGFjaW5nOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRkZWxldGUgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblx0XHRjaGlsZHJlbiA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuXHRcdGluc2VydCA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdH07XG5cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzZWxmLCB7XG5cblx0XHRkb20gOiB7XG5cdFx0XHR2YWx1ZSA6IGRvbS5jb250YWluZXIsXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH0sXG5cblx0XHRpc1Jvb3Q6IHtcblx0XHRcdGdldCA6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiBpc1Jvb3RfO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRwYXJlbnQ6IHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwYXJlbnRfO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjaGlsZHJlbjoge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IG51bGw7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnYXJyYXknKSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gY2hpbGRyZW47XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0XHRyZXN1bHQgPSB7fTtcblx0XHRcdFx0XHRjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtlLm5hbWVdID0gZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRyZWFkb25seToge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICEhKHJlYWRvbmx5ICYgMSk7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbihybykge1xuXHRcdFx0XHRyZWFkb25seSA9IHNldEJpdChyZWFkb25seSwgMCwgK3JvKTtcblx0XHRcdFx0ISEocmVhZG9ubHkgJiAxKSA/IGRvbS5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgncmVhZG9ubHknKVxuXHRcdFx0XHRcdFx0OiBkb20uY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3JlYWRvbmx5Jyk7XG5cdFx0XHRcdGZvciAodmFyIGkgaW4gY2hpbGRyZW4pIHtcblx0XHRcdFx0XHRjaGlsZHJlbltpXS5yZWFkb25seSA9IHNldEJpdChyZWFkb25seSwgMCwgK3JvKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRyZWFkb25seVdoZW5GaWx0ZXJpbmc6IHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiByZWFkb25seVdoZW5GaWx0ZXJpbmc7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbihyb3dmKSB7XG5cdFx0XHRcdHJlYWRvbmx5ID0gc2V0Qml0KHJlYWRvbmx5LCAxLCArcm93Zik7XG5cdFx0XHRcdHJlYWRvbmx5V2hlbkZpbHRlcmluZyA9IHJvd2Y7XG5cdFx0XHRcdChyZWFkb25seSAmJiB0aGlzLmZpbHRlclRleHQpIHx8ICEhKHJlYWRvbmx5ICYgMSlcblx0XHRcdFx0XHRcdD8gZG9tLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdyZWFkb25seScpXG5cdFx0XHRcdFx0XHRcdFx0OiBkb20uY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3JlYWRvbmx5Jyk7XG5cdFx0XHRcdGZvciAodmFyIGkgaW4gY2hpbGRyZW4pIHtcblx0XHRcdFx0XHRjaGlsZHJlbltpXS5yZWFkb25seSA9IHNldEJpdChyZWFkb25seSwgMSwgK3Jvd2YpO1xuXHRcdFx0XHRcdGNoaWxkcmVuW2ldLnJlYWRvbmx5V2hlbkZpbHRlcmluZyA9IHJvd2Y7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aGlkZGVuOiB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gaGlkZGVuO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24oaCkge1xuXHRcdFx0XHRoaWRkZW4gPSBoO1xuXHRcdFx0XHRoID8gZG9tLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuXHRcdFx0XHRcdFx0OiBkb20uY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuXHRcdFx0XHRpZiAoIWgpIHtcblx0XHRcdFx0XHRwYXJlbnRfICYmIChwYXJlbnRfLmhpZGRlbiA9IGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGZpbHRlclRleHQ6IHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBmaWx0ZXJUZXh0O1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24odGV4dCkge1xuXHRcdFx0XHRmaWx0ZXJUZXh0ID0gdGV4dDtcblx0XHRcdFx0aWYgKHRleHQpIHtcblx0XHRcdFx0XHRpZiAocmVhZG9ubHkgPiAwKSB7XG5cdFx0XHRcdFx0XHRkb20uY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3JlYWRvbmx5Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBrZXkgPSB0aGlzLm5hbWUgKyAnJztcblx0XHRcdFx0XHR2YXIgdmFsdWUgPSB0aGlzLnZhbHVlICsgJyc7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmRleE9mKHRleHQpID4gLTEgfHwgdmFsdWUuaW5kZXhPZih0ZXh0KSA+IC0xKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhpZGRlbiA9IGZhbHNlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuYWx3YXlzU2hvd1Jvb3QgfHwgIWlzUm9vdF8pIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5oaWRkZW4gPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQhdGhpcy5yZWFkb25seSAmJiBkb20uY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3JlYWRvbmx5Jyk7XG5cdFx0XHRcdFx0dGhpcy5oaWRkZW4gPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGNoaWxkcmVuKSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5baV0uZmlsdGVyVGV4dCA9IHRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0YWx3YXlzU2hvd1Jvb3Q6IHtcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBhbHdheXNTaG93Um9vdDtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdGlmIChpc1Jvb3RfICYmIHRoaXMuZmlsdGVyVGV4dCkge1xuXHRcdFx0XHRcdHRoaXMuaGlkZGVuID0gIXZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFsd2F5c1Nob3dSb290ID0gdmFsdWU7XG5cdFx0XHRcdGZvciAodmFyIGkgaW4gY2hpbGRyZW4pIHtcblx0XHRcdFx0XHRjaGlsZHJlbltpXS5hbHdheXNTaG93Um9vdCA9IHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHdpdGhSb290TmFtZToge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGluY2x1ZGluZ1Jvb3ROYW1lO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdFx0aW5jbHVkaW5nUm9vdE5hbWUgPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0bmFtZSA6IHtcblx0XHRcdGdldCA6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiBuYW1lO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0IDogc2V0TmFtZSxcblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSxcblxuXHRcdHZhbHVlIDoge1xuXHRcdFx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0IDogc2V0VmFsdWUsXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH0sXG5cblx0XHR0eXBlIDoge1xuXHRcdFx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIHR5cGU7XG5cdFx0XHR9LFxuXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH0sXG5cblx0XHRuYW1lRWRpdGFibGUgOiB7XG5cdFx0XHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gbmFtZUVkaXRhYmxlO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0IDogZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRuYW1lRWRpdGFibGUgPSAhIXZhbHVlO1xuXHRcdFx0fSxcblxuXHRcdFx0ZW51bWVyYWJsZSA6IHRydWVcblx0XHR9LFxuXG5cdFx0dmFsdWVFZGl0YWJsZSA6IHtcblx0XHRcdGdldCA6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZUVkaXRhYmxlO1xuXHRcdFx0fSxcblxuXHRcdFx0c2V0IDogZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YWx1ZUVkaXRhYmxlID0gISF2YWx1ZTtcblx0XHRcdH0sXG5cblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSxcblxuXHRcdHJlZnJlc2ggOiB7XG5cdFx0XHR2YWx1ZSA6IHJlZnJlc2gsXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH0sXG5cblx0XHRjb2xsYXBzZSA6IHtcblx0XHRcdHZhbHVlIDogY29sbGFwc2UsXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH0sXG5cblx0XHRleHBhbmQgOiB7XG5cdFx0XHR2YWx1ZSA6IGV4cGFuZCxcblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSxcblxuXHRcdGRlc3Ryb3kgOiB7XG5cdFx0XHR2YWx1ZSA6IGRlc3Ryb3ksXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH0sXG5cblx0XHRlZGl0TmFtZSA6IHtcblx0XHRcdHZhbHVlIDogZWRpdEZpZWxkLmJpbmQobnVsbCwgJ25hbWUnKSxcblx0XHRcdGVudW1lcmFibGUgOiB0cnVlXG5cdFx0fSxcblxuXHRcdGVkaXRWYWx1ZSA6IHtcblx0XHRcdHZhbHVlIDogZWRpdEZpZWxkLmJpbmQobnVsbCwgJ3ZhbHVlJyksXG5cdFx0XHRlbnVtZXJhYmxlIDogdHJ1ZVxuXHRcdH1cblxuXHR9KTtcblxuXG5cdE9iamVjdC5rZXlzKGRvbSkuZm9yRWFjaChmdW5jdGlvbihrKXtcblx0XHRpZiAoayA9PT0gJ2RlbGV0ZScgJiYgc2VsZi5pc1Jvb3QpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgZWxlbWVudCA9IGRvbVtrXTtcblxuXHRcdGlmKGsgPT0gJ2NvbnRhaW5lcicpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lID0gaztcblx0XHRpZiAoWyduYW1lJywgJ3NlcGFyYXRvcicsICd2YWx1ZScsICdzcGFjaW5nJ10uaW5kZXhPZihrKSA+IC0xKSB7XG5cdFx0XHRlbGVtZW50LmNsYXNzTmFtZSArPSAnIGl0ZW0nO1xuXHRcdH1cblx0XHRkb20uY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuXHR9KTtcblxuXHRkb20uY29udGFpbmVyLmNsYXNzTmFtZSA9ICdqc29uVmlldyc7XG5cblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20uY29sbGFwc2VFeHBhbmQsICdjbGljaycsIG9uQ29sbGFwc2VFeHBhbmRDbGljayk7XG5cdGFkZERvbUV2ZW50TGlzdGVuZXIoZG9tLnZhbHVlLCAnY2xpY2snLCBleHBhbmQuYmluZChudWxsLCBmYWxzZSkpO1xuXHRhZGREb21FdmVudExpc3RlbmVyKGRvbS5uYW1lLCAnY2xpY2snLCBleHBhbmQuYmluZChudWxsLCBmYWxzZSkpO1xuXG5cdGFkZERvbUV2ZW50TGlzdGVuZXIoZG9tLm5hbWUsICdkYmxjbGljaycsIGVkaXRGaWVsZC5iaW5kKG51bGwsICduYW1lJykpO1xuXHRhZGREb21FdmVudExpc3RlbmVyKGRvbS5uYW1lLCAnY2xpY2snLCBpdGVtQ2xpY2tlZC5iaW5kKG51bGwsICduYW1lJykpO1xuXHRhZGREb21FdmVudExpc3RlbmVyKGRvbS5uYW1lLCAnYmx1cicsIGVkaXRGaWVsZFN0b3AuYmluZChudWxsLCAnbmFtZScpKTtcblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20ubmFtZSwgJ2tleXByZXNzJyxcblx0XHRcdGVkaXRGaWVsZEtleVByZXNzZWQuYmluZChudWxsLCAnbmFtZScpKTtcblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20ubmFtZSwgJ2tleWRvd24nLFxuXHRcdFx0ZWRpdEZpZWxkVGFiUHJlc3NlZC5iaW5kKG51bGwsICduYW1lJykpO1xuXG5cdGFkZERvbUV2ZW50TGlzdGVuZXIoZG9tLnZhbHVlLCAnZGJsY2xpY2snLCBlZGl0RmllbGQuYmluZChudWxsLCAndmFsdWUnKSk7XG5cdGFkZERvbUV2ZW50TGlzdGVuZXIoZG9tLnZhbHVlLCAnY2xpY2snLCBpdGVtQ2xpY2tlZC5iaW5kKG51bGwsICd2YWx1ZScpKTtcblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20udmFsdWUsICdibHVyJywgZWRpdEZpZWxkU3RvcC5iaW5kKG51bGwsICd2YWx1ZScpKTtcblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20udmFsdWUsICdrZXlwcmVzcycsXG5cdFx0XHRlZGl0RmllbGRLZXlQcmVzc2VkLmJpbmQobnVsbCwgJ3ZhbHVlJykpO1xuXHRhZGREb21FdmVudExpc3RlbmVyKGRvbS52YWx1ZSwgJ2tleWRvd24nLFxuXHRcdFx0ZWRpdEZpZWxkVGFiUHJlc3NlZC5iaW5kKG51bGwsICd2YWx1ZScpKTtcblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20udmFsdWUsICdrZXlkb3duJywgbnVtZXJpY1ZhbHVlS2V5RG93bik7XG5cblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20uaW5zZXJ0LCAnY2xpY2snLCBvbkluc2VydENsaWNrKTtcblx0YWRkRG9tRXZlbnRMaXN0ZW5lcihkb20uZGVsZXRlLCAnY2xpY2snLCBvbkRlbGV0ZUNsaWNrKTtcblxuXHRzZXROYW1lKG5hbWVfKTtcblx0c2V0VmFsdWUodmFsdWVfKTtcblxuXHRmdW5jdGlvbiBzZXRCaXQobiwgaSwgYikge1xuXHRcdHZhciBqID0gMDtcblx0XHR3aGlsZSAoKG4gPj4gaiA8PCBqKSkge1xuXHRcdFx0aisrO1xuXHRcdH1cblx0XHRyZXR1cm4gaSA+PSBqXG5cdFx0XHRcdD8gKG4gfCArYiA8PCBpIClcblx0XHRcdFx0XHRcdDogKG4gPj4gKGkgKyAxKSA8PCAoaSArIDEpKSB8IChuICUgKG4gPj4gaSA8PCBpKSkgfCAoK2IgPDwgaSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIHNxdWFyZWJyYWNrZXRpZnkoZXhwKSB7XG5cdFx0cmV0dXJuIHR5cGVvZiBleHAgPT09ICdzdHJpbmcnXG5cdFx0XHQ/IGV4cC5yZXBsYWNlKC9cXC4oWzAtOV0rKS9nLCAnWyQxXScpIDogZXhwICsgJyc7XG5cdH1cblxuXHRmdW5jdGlvbiByZWZyZXNoKG5vRW1pdHRpbmcpe1xuXHRcdHZhciBleHBhbmRhYmxlID0gdHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdhcnJheSc7XG5cblx0XHRjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKXtcblx0XHRcdGNoaWxkLnJlZnJlc2godHJ1ZSk7XG5cdFx0fSk7XG5cblx0XHRkb20uY29sbGFwc2VFeHBhbmQuc3R5bGUuZGlzcGxheSA9IGV4cGFuZGFibGUgPyAnJyA6ICdub25lJztcblxuXHRcdGlmKGV4cGFuZGVkICYmIGV4cGFuZGFibGUpe1xuXHRcdFx0ZXhwYW5kKGZhbHNlLCBub0VtaXR0aW5nKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGNvbGxhcHNlKGZhbHNlLCBub0VtaXR0aW5nKTtcblx0XHR9XG5cdFx0IW5vRW1pdHRpbmcgJiYgc2VsZi5lbWl0KCdyZWZyZXNoJywgc2VsZiwgc2VsZi5uYW1lLCBzZWxmLnZhbHVlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gY29sbGFwc2UocmVjdXJzaXZlLCBub0VtaXR0aW5nKXtcblx0XHRpZihyZWN1cnNpdmUpe1xuXHRcdFx0Y2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCl7XG5cdFx0XHRcdGNoaWxkLmNvbGxhcHNlKHRydWUsIHRydWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0ZXhwYW5kZWQgPSBmYWxzZTtcblxuXHRcdGRvbS5jaGlsZHJlbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdGRvbS5jb2xsYXBzZUV4cGFuZC5jbGFzc05hbWUgPSAnZXhwYW5kJztcblx0XHRkb20uY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlZCcpO1xuXHRcdGRvbS5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZXhwYW5kZWQnKTtcblx0XHQhbm9FbWl0dGluZyAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdhcnJheScpXG5cdFx0XHQmJiBzZWxmLmVtaXQoJ2NvbGxhcHNlJywgc2VsZiwgc2VsZi5uYW1lLCBzZWxmLnZhbHVlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gZXhwYW5kKHJlY3Vyc2l2ZSwgbm9FbWl0dGluZyl7XG5cdFx0dmFyIGtleXM7XG5cblx0XHRpZih0eXBlID09ICdvYmplY3QnKXtcblx0XHRcdGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG5cdFx0fVxuXHRcdGVsc2UgaWYodHlwZSA9PSAnYXJyYXknKXtcblx0XHRcdGtleXMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24odiwgayl7XG5cdFx0XHRcdHJldHVybiBrO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRrZXlzID0gW107XG5cdFx0fVxuXG5cdFx0Ly8gUmVtb3ZlIGNoaWxkcmVuIHRoYXQgbm8gbG9uZ2VyIGV4aXN0XG5cdFx0Zm9yKHZhciBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC0tKXtcblx0XHRcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuXG5cdFx0XHRpZihrZXlzLmluZGV4T2YoY2hpbGQubmFtZSkgPT0gLTEpe1xuXHRcdFx0XHRjaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdHJlbW92ZUNoaWxkKGNoaWxkLCBub0VtaXR0aW5nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZih0eXBlICE9ICdvYmplY3QnICYmIHR5cGUgIT0gJ2FycmF5Jyl7XG5cdFx0XHRyZXR1cm4gY29sbGFwc2UoKTtcblx0XHR9XG5cblx0XHRrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcblx0XHRcdGFkZENoaWxkKGtleSwgdmFsdWVba2V5XSk7XG5cdFx0fSk7XG5cblx0XHRpZihyZWN1cnNpdmUpe1xuXHRcdFx0Y2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCl7XG5cdFx0XHRcdGNoaWxkLmV4cGFuZCh0cnVlLCB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGV4cGFuZGVkID0gdHJ1ZTtcblx0XHRkb20uY2hpbGRyZW4uc3R5bGUuZGlzcGxheSA9ICcnO1xuXHRcdGRvbS5jb2xsYXBzZUV4cGFuZC5jbGFzc05hbWUgPSAnY29sbGFwc2UnO1xuXHRcdGRvbS5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZXhwYW5kZWQnKTtcblx0XHRkb20uY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2NvbGxhcHNlZCcpO1xuXHRcdCFub0VtaXR0aW5nICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2FycmF5Jylcblx0XHRcdCYmIHNlbGYuZW1pdCgnZXhwYW5kJywgc2VsZiwgc2VsZi5uYW1lLCBzZWxmLnZhbHVlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gZGVzdHJveSgpe1xuXHRcdHZhciBjaGlsZCwgZXZlbnQ7XG5cblx0XHR3aGlsZShldmVudCA9IGRvbUV2ZW50TGlzdGVuZXJzLnBvcCgpKXtcblx0XHRcdGV2ZW50LmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudC5uYW1lLCBldmVudC5mbik7XG5cdFx0fVxuXG5cdFx0d2hpbGUoY2hpbGQgPSBjaGlsZHJlbi5wb3AoKSl7XG5cdFx0XHRyZW1vdmVDaGlsZChjaGlsZCwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBzZXROYW1lKG5ld05hbWUpe1xuXHRcdHZhciBuYW1lVHlwZSA9IHR5cGVvZiBuZXdOYW1lLFxuXHRcdFx0b2xkTmFtZSA9IG5hbWU7XG5cblx0XHRpZihuZXdOYW1lID09PSBuYW1lKXtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZihuYW1lVHlwZSAhPSAnc3RyaW5nJyAmJiBuYW1lVHlwZSAhPSAnbnVtYmVyJyl7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ05hbWUgbXVzdCBiZSBlaXRoZXIgc3RyaW5nIG9yIG51bWJlciwgJyArIG5ld05hbWUpO1xuXHRcdH1cblxuXHRcdGRvbS5uYW1lLmlubmVyVGV4dCA9IG5ld05hbWU7XG5cdFx0bmFtZSA9IG5ld05hbWU7XG5cdFx0c2VsZi5lbWl0KCdyZW5hbWUnLCBzZWxmLCBuYW1lLCBvbGROYW1lLCBuZXdOYW1lLCB0cnVlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gc2V0VmFsdWUobmV3VmFsdWUpe1xuXHRcdHZhciBvbGRWYWx1ZSA9IHZhbHVlLFxuXHRcdFx0c3RyO1xuXG5cdFx0dHlwZSA9IGdldFR5cGUobmV3VmFsdWUpO1xuXG5cdFx0c3dpdGNoKHR5cGUpe1xuXHRcdFx0Y2FzZSAnbnVsbCc6XG5cdFx0XHRcdHN0ciA9ICdudWxsJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd1bmRlZmluZWQnOlxuXHRcdFx0XHRzdHIgPSAndW5kZWZpbmVkJztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdvYmplY3QnOlxuXHRcdFx0XHRzdHIgPSAnT2JqZWN0WycgKyBPYmplY3Qua2V5cyhuZXdWYWx1ZSkubGVuZ3RoICsgJ10nO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYXJyYXknOlxuXHRcdFx0XHRzdHIgPSAnQXJyYXlbJyArIG5ld1ZhbHVlLmxlbmd0aCArICddJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHN0ciA9IG5ld1ZhbHVlO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRkb20udmFsdWUuaW5uZXJUZXh0ID0gc3RyO1xuXHRcdGRvbS52YWx1ZS5jbGFzc05hbWUgPSAndmFsdWUgaXRlbSAnICsgdHlwZTtcblxuXHRcdGlmKG5ld1ZhbHVlID09PSB2YWx1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFsdWUgPSBuZXdWYWx1ZTtcblxuXHRcdGlmKHR5cGUgPT0gJ2FycmF5JyB8fCB0eXBlID09ICdvYmplY3QnKXtcblx0XHRcdC8vIENhbm5vdCBlZGl0IG9iamVjdHMgYXMgc3RyaW5nIGJlY2F1c2UgdGhlIGZvcm1hdHRpbmcgaXMgdG9vIG1lc3N5XG5cdFx0XHQvLyBXb3VsZCBoYXZlIHRvIGVpdGhlciBwYXNzIGFzIEpTT04gYW5kIGZvcmNlIHVzZXIgdG8gd3JhcCBwcm9wZXJ0aWVzIGluIHF1b3Rlc1xuXHRcdFx0Ly8gT3IgZmlyc3QgSlNPTiBzdHJpbmdpZnkgdGhlIGlucHV0IGJlZm9yZSBwYXNzaW5nLCB0aGlzIGNvdWxkIGFsbG93IHVzZXJzIHRvIHJlZmVyZW5jZSBnbG9iYWxzXG5cblx0XHRcdC8vIEluc3RlYWQgdGhlIHVzZXIgY2FuIG1vZGlmeSBpbmRpdmlkdWFsIHByb3BlcnRpZXMsIG9yIGp1c3QgZGVsZXRlIHRoZSBvYmplY3QgYW5kIHN0YXJ0IGFnYWluXG5cdFx0XHR2YWx1ZUVkaXRhYmxlID0gZmFsc2U7XG5cblx0XHRcdGlmKHR5cGUgPT0gJ2FycmF5Jyl7XG5cdFx0XHRcdC8vIE9idmlvdXNseSBjYW5ub3QgbW9kaWZ5IGFycmF5IGtleXNcblx0XHRcdFx0bmFtZUVkaXRhYmxlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2VsZi5lbWl0KCdjaGFuZ2UnLCBzZWxmLCBuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXHRcdHJlZnJlc2goKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gdXBkYXRlT2JqZWN0Q2hpbGRDb3VudCgpIHtcblx0XHR2YXIgc3RyO1xuXHRcdGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0c3RyID0gJ09iamVjdFsnICsgT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCArICddJztcblx0XHR9XG5cdFx0aWYgKHR5cGUgPT09ICdhcnJheScpIHtcblx0XHRcdHN0ciA9ICdBcnJheVsnICsgdmFsdWUubGVuZ3RoICsgJ10nO1xuXHRcdH1cblx0XHRkb20udmFsdWUuaW5uZXJUZXh0ID0gc3RyO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBhZGRDaGlsZChrZXksIHZhbCwgbm9FbWl0dGluZyl7XG5cdFx0dmFyIGNoaWxkO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgbGVuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpICsrKXtcblx0XHRcdGlmKGNoaWxkcmVuW2ldLm5hbWUgPT0ga2V5KXtcblx0XHRcdFx0Y2hpbGQgPSBjaGlsZHJlbltpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoY2hpbGQpe1xuXHRcdFx0Y2hpbGQudmFsdWUgPSB2YWw7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRjaGlsZCA9IG5ldyBKU09OVHJlZVZpZXcoa2V5LCB2YWwsIHNlbGYsIGZhbHNlKTtcblx0XHRcdGNoaWxkLm9uKCdyZW5hbWUnLCBvbkNoaWxkUmVuYW1lKTtcblx0XHRcdGNoaWxkLm9uKCdkZWxldGUnLCBvbkNoaWxkRGVsZXRlKTtcblx0XHRcdGNoaWxkLm9uKCdjaGFuZ2UnLCBvbkNoaWxkQ2hhbmdlKTtcblx0XHRcdGNoaWxkLm9uKCdhcHBlbmQnLCBvbkNoaWxkQXBwZW5kKTtcblx0XHRcdGNoaWxkLm9uKCdjbGljaycsIG9uQ2hpbGRDbGljayk7XG5cdFx0XHRjaGlsZC5vbignZXhwYW5kJywgb25DaGlsZEV4cGFuZCk7XG5cdFx0XHRjaGlsZC5vbignY29sbGFwc2UnLCBvbkNoaWxkQ29sbGFwc2UpO1xuXHRcdFx0Y2hpbGQub24oJ3JlZnJlc2gnLCBvbkNoaWxkUmVmcmVzaCk7XG5cdFx0XHRjaGlsZHJlbi5wdXNoKGNoaWxkKTtcblx0XHRcdGlmICghbm9FbWl0dGluZykge1xuXHRcdFx0XHRjaGlsZC5lbWl0KCdhcHBlbmQnLCBjaGlsZCwga2V5LCAndmFsdWUnLCB2YWwsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGRvbS5jaGlsZHJlbi5hcHBlbmRDaGlsZChjaGlsZC5kb20pO1xuXG5cdFx0cmV0dXJuIGNoaWxkO1xuXHR9XG5cblxuXHRmdW5jdGlvbiByZW1vdmVDaGlsZChjaGlsZCwgbm9FbWl0dGluZyl7XG5cdFx0aWYoY2hpbGQuZG9tLnBhcmVudE5vZGUpe1xuXHRcdFx0ZG9tLmNoaWxkcmVuLnJlbW92ZUNoaWxkKGNoaWxkLmRvbSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFub0VtaXR0aW5nICYmIGNoaWxkICYmIGNoaWxkLm5hbWUgIT09ICcnKSB7XG5cdFx0XHRjaGlsZC5lbWl0KCdkZWxldGUnLCBjaGlsZCwgY2hpbGQubmFtZSwgY2hpbGQudmFsdWUsIGNoaWxkLnBhcmVudC50eXBlLFxuXHRcdFx0XHR0cnVlKTtcblx0XHR9XG5cdFx0Y2hpbGQuZGVzdHJveSgpO1xuXHRcdGNoaWxkLnJlbW92ZUFsbExpc3RlbmVycygpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBlZGl0RmllbGQoZmllbGQpe1xuXHRcdGlmKChyZWFkb25seSA+IDAgJiYgZmlsdGVyVGV4dCkgfHwgISEocmVhZG9ubHkgJiAxKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihmaWVsZCA9PT0gJ3ZhbHVlJyAmJiAodHlwZSA9PT0gJ29iamVjdCcgfHwgdHlwZSA9PT0gJ2FycmF5Jykpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihwYXJlbnRfICYmIHBhcmVudF8udHlwZSA9PSAnYXJyYXknKXtcblx0XHRcdC8vIE9idmlvdXNseSBjYW5ub3QgbW9kaWZ5IGFycmF5IGtleXNcblx0XHRcdG5hbWVFZGl0YWJsZSA9IGZhbHNlO1xuXHRcdH1cblx0XHR2YXIgZWRpdGFibGUgPSBmaWVsZCA9PSAnbmFtZScgPyBuYW1lRWRpdGFibGUgOiB2YWx1ZUVkaXRhYmxlLFxuXHRcdFx0ZWxlbWVudCA9IGRvbVtmaWVsZF07XG5cblx0XHRpZighZWRpdGFibGUgJiYgKHBhcmVudF8gJiYgcGFyZW50Xy50eXBlID09PSAnYXJyYXknKSl7XG5cdFx0XHRpZiAoIXBhcmVudF8uaW5zZXJ0aW5nKSB7XG5cdFx0XHRcdC8vIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGVkaXQgYW4gYXJyYXkgaW5kZXguJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihmaWVsZCA9PSAndmFsdWUnICYmIHR5cGUgPT0gJ3N0cmluZycpe1xuXHRcdFx0ZWxlbWVudC5pbm5lclRleHQgPSAnXCInICsgdmFsdWUgKyAnXCInO1xuXHRcdH1cblxuXHRcdGlmKGZpZWxkID09ICduYW1lJyl7XG5cdFx0XHRlZGl0dGluZ05hbWUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmKGZpZWxkID09ICd2YWx1ZScpe1xuXHRcdFx0ZWRpdHRpbmdWYWx1ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0ZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdlZGl0Jyk7XG5cdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScsIHRydWUpO1xuXHRcdGVsZW1lbnQuZm9jdXMoKTtcblx0XHRkb2N1bWVudC5leGVjQ29tbWFuZCgnc2VsZWN0QWxsJywgZmFsc2UsIG51bGwpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBpdGVtQ2xpY2tlZChmaWVsZCkge1xuXHRcdHNlbGYuZW1pdCgnY2xpY2snLCBzZWxmLFxuXHRcdFx0IXNlbGYud2l0aFJvb3ROYW1lICYmIHNlbGYuaXNSb290ID8gJycgOiBzZWxmLm5hbWUsIHNlbGYudmFsdWUpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBlZGl0RmllbGRTdG9wKGZpZWxkKXtcblx0XHR2YXIgZWxlbWVudCA9IGRvbVtmaWVsZF07XG5cdFx0XG5cdFx0aWYoZmllbGQgPT0gJ25hbWUnKXtcblx0XHRcdGlmKCFlZGl0dGluZ05hbWUpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRlZGl0dGluZ05hbWUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpZihmaWVsZCA9PSAndmFsdWUnKXtcblx0XHRcdGlmKCFlZGl0dGluZ1ZhbHVlKXtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZWRpdHRpbmdWYWx1ZSA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRpZihmaWVsZCA9PSAnbmFtZScpe1xuXHRcdFx0dmFyIHAgPSBzZWxmLnBhcmVudDtcblx0XHRcdHZhciBlZGl0dGluZ05hbWVUZXh0ID0gZWxlbWVudC5pbm5lclRleHQ7XG5cdFx0XHRpZiAocCAmJiBwLnR5cGUgPT09ICdvYmplY3QnICYmIGVkaXR0aW5nTmFtZVRleHQgaW4gcC52YWx1ZSkge1xuXHRcdFx0XHRlbGVtZW50LmlubmVyVGV4dCA9IG5hbWU7XG5cdFx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZWRpdCcpO1xuXHRcdFx0XHRlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJyk7XG5cdFx0XHRcdC8vIHRocm93IG5ldyBFcnJvcignTmFtZSBleGlzdCwgJyArIGVkaXR0aW5nTmFtZVRleHQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNldE5hbWUuY2FsbChzZWxmLCBlZGl0dGluZ05hbWVUZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHZhciB0ZXh0ID0gZWxlbWVudC5pbm5lclRleHQ7XG5cdFx0XHR0cnl7XG5cdFx0XHRcdHNldFZhbHVlKHRleHQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogSlNPTi5wYXJzZSh0ZXh0KSk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaChlcnIpe1xuXHRcdFx0XHRzZXRWYWx1ZSh0ZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2VkaXQnKTtcblx0XHRlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJyk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGVkaXRGaWVsZEtleVByZXNzZWQoZmllbGQsIGUpe1xuXHRcdHN3aXRjaChlLmtleSl7XG5cdFx0XHRjYXNlICdFc2NhcGUnOlxuXHRcdFx0Y2FzZSAnRW50ZXInOlxuXHRcdFx0XHRlZGl0RmllbGRTdG9wKGZpZWxkKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBlZGl0RmllbGRUYWJQcmVzc2VkKGZpZWxkLCBlKXtcblx0XHRpZihlLmtleSA9PSAnVGFiJyl7XG5cdFx0XHRlZGl0RmllbGRTdG9wKGZpZWxkKTtcblxuXHRcdFx0aWYoZmllbGQgPT0gJ25hbWUnKXtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRlZGl0RmllbGQoJ3ZhbHVlJyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRlZGl0RmllbGRTdG9wKGZpZWxkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG51bWVyaWNWYWx1ZUtleURvd24oZSl7XG5cdFx0dmFyIGluY3JlbWVudCA9IDAsIGN1cnJlbnRWYWx1ZTtcblxuXHRcdGlmKHR5cGUgIT0gJ251bWJlcicpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHN3aXRjaChlLmtleSl7XG5cdFx0XHRjYXNlICdBcnJvd0Rvd24nOlxuXHRcdFx0Y2FzZSAnRG93bic6XG5cdFx0XHRcdGluY3JlbWVudCA9IC0xO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnQXJyb3dVcCc6XG5cdFx0XHRjYXNlICdVcCc6XG5cdFx0XHRcdGluY3JlbWVudCA9IDE7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGlmKGUuc2hpZnRLZXkpe1xuXHRcdFx0aW5jcmVtZW50ICo9IDEwO1xuXHRcdH1cblxuXHRcdGlmKGUuY3RybEtleSB8fCBlLm1ldGFLZXkpe1xuXHRcdFx0aW5jcmVtZW50IC89IDEwO1xuXHRcdH1cblxuXHRcdGlmKGluY3JlbWVudCl7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBwYXJzZUZsb2F0KGRvbS52YWx1ZS5pbm5lclRleHQpO1xuXG5cdFx0XHRpZighaXNOYU4oY3VycmVudFZhbHVlKSl7XG5cdFx0XHRcdHNldFZhbHVlKE51bWJlcigoY3VycmVudFZhbHVlICsgaW5jcmVtZW50KS50b0ZpeGVkKDEwKSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gZ2V0VHlwZSh2YWx1ZSl7XG5cdFx0dmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cblx0XHRpZih0eXBlID09ICdvYmplY3QnKXtcblx0XHRcdGlmKHZhbHVlID09PSBudWxsKXtcblx0XHRcdFx0cmV0dXJuICdudWxsJztcblx0XHRcdH1cblxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheSh2YWx1ZSkpe1xuXHRcdFx0XHRyZXR1cm4gJ2FycmF5Jztcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gJ3VuZGVmaW5lZCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHR5cGU7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uQ29sbGFwc2VFeHBhbmRDbGljaygpe1xuXHRcdGlmKGV4cGFuZGVkKXtcblx0XHRcdGNvbGxhcHNlKCk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRleHBhbmQoKTtcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uSW5zZXJ0Q2xpY2soKXtcblx0XHR2YXIgbmV3TmFtZSA9IHR5cGUgPT0gJ2FycmF5JyA/IHZhbHVlLmxlbmd0aCA6IHVuZGVmaW5lZCxcblx0XHRcdGNoaWxkID0gYWRkQ2hpbGQobmV3TmFtZSwgbnVsbCwgdHJ1ZSk7XG5cdFx0aWYgKGNoaWxkLnBhcmVudCkge1xuXHRcdFx0Y2hpbGQucGFyZW50Lmluc2VydGluZyA9IHRydWU7XG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ2FycmF5Jyl7XG5cdFx0XHR2YWx1ZS5wdXNoKG51bGwpO1xuXHRcdFx0Y2hpbGQuZWRpdFZhbHVlKCk7XG5cdFx0XHRjaGlsZC5lbWl0KCdhcHBlbmQnLCBzZWxmLCB2YWx1ZS5sZW5ndGggLSAxLCAndmFsdWUnLCBudWxsLCB0cnVlKTtcblx0XHRcdGlmIChjaGlsZC5wYXJlbnQpIHtcblx0XHRcdFx0Y2hpbGQucGFyZW50Lmluc2VydGluZyA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0Y2hpbGQuZWRpdE5hbWUoKTtcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uRGVsZXRlQ2xpY2soKXtcblx0XHRzZWxmLmVtaXQoJ2RlbGV0ZScsIHNlbGYsIHNlbGYubmFtZSwgc2VsZi52YWx1ZSwgc2VsZi5wYXJlbnQudHlwZSwgdHJ1ZSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uQ2hpbGRSZW5hbWUoY2hpbGQsIGtleVBhdGgsIG9sZE5hbWUsIG5ld05hbWUsIG9yaWdpbmFsKXtcblx0XHR2YXIgYWxsb3cgPSBuZXdOYW1lICYmIHR5cGUgIT0gJ2FycmF5JyAmJiAhKG5ld05hbWUgaW4gdmFsdWUpICYmIG9yaWdpbmFsO1xuXHRcdGlmKGFsbG93KXtcblx0XHRcdHZhbHVlW25ld05hbWVdID0gY2hpbGQudmFsdWU7XG5cdFx0XHRkZWxldGUgdmFsdWVbb2xkTmFtZV07XG5cdFx0XHRpZiAoc2VsZi5pbnNlcnRpbmcpIHtcblx0XHRcdFx0Y2hpbGQuZW1pdCgnYXBwZW5kJywgY2hpbGQsIG5ld05hbWUsICduYW1lJywgbmV3TmFtZSwgdHJ1ZSk7XG5cdFx0XHRcdHNlbGYuaW5zZXJ0aW5nID0gZmFsc2U7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZihvbGROYW1lID09PSB1bmRlZmluZWQpe1xuXHRcdFx0Ly8gQSBuZXcgbm9kZSBpbnNlcnRlZCB2aWEgdGhlIFVJXG5cdFx0XHRvcmlnaW5hbCAmJiByZW1vdmVDaGlsZChjaGlsZCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKG9yaWdpbmFsKXtcblx0XHRcdC8vIENhbm5vdCByZW5hbWUgYXJyYXkga2V5cywgb3IgZHVwbGljYXRlIG9iamVjdCBrZXkgbmFtZXNcblx0XHRcdGNoaWxkLm5hbWUgPSBvbGROYW1lO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyB2YWx1ZVtrZXlQYXRoXSA9IG5ld05hbWU7XG5cblx0XHQvLyBjaGlsZC5vbmNlKCdyZW5hbWUnLCBvbkNoaWxkUmVuYW1lKTtcblx0XHR2YXIgbmV3S2V5UGF0aCA9IGNoaWxkID09PSBzZWxmIHx8ICghc2VsZi53aXRoUm9vdE5hbWUgJiYgc2VsZi5pc1Jvb3QpXG5cdFx0XHQ/IGtleVBhdGhcblx0XHRcdDogbmFtZSArICcuJyArIGtleVBhdGg7XG5cdFx0aWYgKG9sZE5hbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0c2VsZi5lbWl0KCdyZW5hbWUnLCBjaGlsZCwgc3F1YXJlYnJhY2tldGlmeShuZXdLZXlQYXRoKSwgb2xkTmFtZSwgbmV3TmFtZSxcblx0XHRcdFx0ZmFsc2UpO1xuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gb25DaGlsZEFwcGVuZChjaGlsZCwga2V5UGF0aCwgbmFtZU9yVmFsdWUsIG5ld1ZhbHVlLCBzZW5kZXIpe1xuXHRcdHZhciBuZXdLZXlQYXRoID0gIXNlbGYud2l0aFJvb3ROYW1lICYmIHNlbGYuaXNSb290XG5cdFx0XHQ/IGtleVBhdGhcblx0XHRcdDogbmFtZSArICcuJyArIGtleVBhdGg7XG5cdFx0c2VsZi5lbWl0KCdhcHBlbmQnLCBjaGlsZCwgc3F1YXJlYnJhY2tldGlmeShuZXdLZXlQYXRoKSwgbmFtZU9yVmFsdWUsXG5cdFx0XHRuZXdWYWx1ZSwgZmFsc2UpO1xuXHRcdHNlbmRlciAmJiB1cGRhdGVPYmplY3RDaGlsZENvdW50KCk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uQ2hpbGRDaGFuZ2UoY2hpbGQsIGtleVBhdGgsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgcmVjdXJzZWQpe1xuXHRcdGlmKCFyZWN1cnNlZCl7XG5cdFx0XHR2YWx1ZVtrZXlQYXRoXSA9IG5ld1ZhbHVlO1xuXHRcdH1cblxuXHRcdHZhciBuZXdLZXlQYXRoID0gIXNlbGYud2l0aFJvb3ROYW1lICYmIHNlbGYuaXNSb290XG5cdFx0XHQ/IGtleVBhdGhcblx0XHRcdDogbmFtZSArICcuJyArIGtleVBhdGg7XG5cdFx0c2VsZi5lbWl0KCdjaGFuZ2UnLCBjaGlsZCwgc3F1YXJlYnJhY2tldGlmeShuZXdLZXlQYXRoKSwgb2xkVmFsdWUsIG5ld1ZhbHVlLFxuXHRcdFx0dHJ1ZSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uQ2hpbGREZWxldGUoY2hpbGQsIGtleVBhdGgsIGRlbGV0ZWRWYWx1ZSwgcGFyZW50VHlwZSwgc2VuZGVyKXtcblx0XHR2YXIga2V5ID0gY2hpbGQubmFtZTtcblxuXHRcdGlmKHR5cGUgPT0gJ2FycmF5Jyl7XG5cdFx0XHR2YWx1ZS5zcGxpY2Uoa2V5LCAxKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoc2VuZGVyKSB7XG5cdFx0XHRkZWxldGUgdmFsdWVba2V5XTtcblx0XHR9XG5cblx0XHR2YXIgbmV3S2V5UGF0aCA9ICFzZWxmLndpdGhSb290TmFtZSAmJiBzZWxmLmlzUm9vdFxuXHRcdFx0PyBrZXlQYXRoXG5cdFx0XHQ6IG5hbWUgKyAnLicgKyBrZXlQYXRoO1xuXHRcdHNlbGYuZW1pdCgnZGVsZXRlJywgY2hpbGQsIHNxdWFyZWJyYWNrZXRpZnkobmV3S2V5UGF0aCksIGRlbGV0ZWRWYWx1ZSxcblx0XHRcdHBhcmVudFR5cGUsIGZhbHNlKTtcblx0XHRzZW5kZXIgJiYgdXBkYXRlT2JqZWN0Q2hpbGRDb3VudCgpO1xuXHRcdHJlZnJlc2godHJ1ZSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uQ2hpbGRDbGljayhjaGlsZCwga2V5UGF0aCwgdmFsdWUpIHtcblx0XHR2YXIgbmV3S2V5UGF0aCA9ICFzZWxmLndpdGhSb290TmFtZSAmJiBzZWxmLmlzUm9vdFxuXHRcdFx0PyBrZXlQYXRoXG5cdFx0XHQ6IG5hbWUgKyAnLicgKyBrZXlQYXRoO1xuXHRcdHNlbGYuZW1pdCgnY2xpY2snLCBjaGlsZCwgc3F1YXJlYnJhY2tldGlmeShuZXdLZXlQYXRoKSwgdmFsdWUpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBvbkNoaWxkRXhwYW5kKGNoaWxkLCBrZXlQYXRoLCB2YWx1ZSkge1xuXHRcdHZhciBuZXdLZXlQYXRoID0gIXNlbGYud2l0aFJvb3ROYW1lICYmIHNlbGYuaXNSb290XG5cdFx0XHQ/IGtleVBhdGhcblx0XHRcdDogbmFtZSArICcuJyArIGtleVBhdGg7XG5cdFx0c2VsZi5lbWl0KCdleHBhbmQnLCBjaGlsZCwgc3F1YXJlYnJhY2tldGlmeShuZXdLZXlQYXRoKSwgdmFsdWUpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBvbkNoaWxkQ29sbGFwc2UoY2hpbGQsIGtleVBhdGgsIHZhbHVlKSB7XG5cdFx0dmFyIG5ld0tleVBhdGggPSAhc2VsZi53aXRoUm9vdE5hbWUgJiYgc2VsZi5pc1Jvb3Rcblx0XHRcdD8ga2V5UGF0aFxuXHRcdFx0OiBuYW1lICsgJy4nICsga2V5UGF0aDtcblx0XHRzZWxmLmVtaXQoJ2NvbGxhcHNlJywgY2hpbGQsIHNxdWFyZWJyYWNrZXRpZnkobmV3S2V5UGF0aCksIHZhbHVlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gb25DaGlsZFJlZnJlc2goY2hpbGQsIGtleVBhdGgsIHZhbHVlKSB7XG5cdFx0dmFyIG5ld0tleVBhdGggPSAhc2VsZi53aXRoUm9vdE5hbWUgJiYgc2VsZi5pc1Jvb3Rcblx0XHRcdD8ga2V5UGF0aFxuXHRcdFx0OiBuYW1lICsgJy4nICsga2V5UGF0aDtcblx0XHRzZWxmLmVtaXQoJ3JlZnJlc2gnLCBjaGlsZCwgc3F1YXJlYnJhY2tldGlmeShuZXdLZXlQYXRoKSwgdmFsdWUpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBhZGREb21FdmVudExpc3RlbmVyKGVsZW1lbnQsIG5hbWUsIGZuKXtcblx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuXHRcdGRvbUV2ZW50TGlzdGVuZXJzLnB1c2goe2VsZW1lbnQgOiBlbGVtZW50LCBuYW1lIDogbmFtZSwgZm4gOiBmbn0pO1xuXHR9XG59IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
