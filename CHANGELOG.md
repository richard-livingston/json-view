ChangeLog
========

0.4.12
-------
 - [Bugfix]
    - Fix bug when setting a value on a JSONTreeView object.
 - [Update]
    - Change keyPath paramater of handlers from a string to an array.
    - Update example.


0.4.11
-------
 - [Bugfix]
    - Inherit parent's readonly options.
    - Ignore toString() value for object and array when filtering.
    - Some setter functions would throw an exception.


0.4.10
-------
 - [Add]
    - Add showCountOfObjectOrArray property which allows you to remove the counter.
 - [Bugfix]
    - Fix bug when removing item in array.


0.4.9
-------
 - [Bugfix]
    - Fix squarebracketify bug.


0.4.7
-------
 - [Add]
    - Add parent type paramater in delete event.


0.4.6
-------
 - [Add]
    - Add some events.


0.4.5
-------
 - [Add]
    - Add alwaysShowRoot switch which allows you to show or hide the root node.
    - Add readonlyWhenFiltering options which can be readonly when filtering text.
    - Add filterText property
    - Add readonly property.
    - Add rename, delete, append event that can observe all kinds of operation.
    - Add children property for each instance.
 - [Bugfix]
    - Fix some readonly bugs.
    - Fix data changed illegal when the value of an object or an array doubleclicked.
 - [Update]
    - Root name can be omitted. Emit events when using refresh.
    - Update example.





