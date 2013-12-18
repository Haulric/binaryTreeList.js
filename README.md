binaryTreeList.js
=================

Standalone list class based on the Binary Search Tree pattern to allow quick and easy sorting of huge lists.

This class doesn't require or prevent the use of any library.

USAGE
=====

The BinaryTreeList class can handle various kind of lists and support sorting and pagination operations.

    var list = new BinaryTreeList();
    
Adding an element to the list.
------------------------------

    list.push(1);
    list.push(3);
    //or
    list.push(5).push(2);

You can add Number, String or literal Object. Array or Function should work too but will prevent sorting operations, also all elements must be of the same type eitherway sorting will fail too.

Retrieve element(s) from the list
---------------------------------

    var list = new BinaryTreeList();
    list.push(3).push(2).push(4);
    list.get();
> 3

    list.move(1); //move to the next element
    list/get();
> 2

Paginate
--------

Setting a pagination will group elements into arrays of the given size

    list.setPagination(2).sort();
    list.get();
> [3,2]

All setXXX commands will take effect after the next sort(), sort will also reset the cursor position to 0.

    list.move(1);
    list.get();
> [4]

Note : If you try to move outside of the curent list scope the move() command will return false and nothing will be done, for the moment circular list are not supported and will require some work upstream.

Sort
----

You need to define the order-by rule eitherway sort() will have no effect.

    list.setOrderBy(true).sort();
    list.get();
> [2,3]

If orderBy is set to false this will disable sorting operation, and the next sort() will rebuild the list in the order of which elements have been pushed.
orderBy only accept true if you are working with a number or a string list.
Object list require a property name.

    list = new BinaryTreeList();
    list.push({ 'id': 2, 'name': 'toto'}).push({'id': 1, 'name': 'tata'});
    list.setSortBy('name').sort();
    list.get();
> {
>   id: 1,
>   name: 'tata'
> }

Filters
-------

You can define a filter which will be called with sort(), the filter will receive the element value as parameter and should return true if you want the element to be added to the list.

    var list = new BinaryTreeList();
    var filter = function(value){
      if(value % 2) return false;
      return true;
    }
    for(var i = 10; i; i--) list.push(i);
    list.setPagination(4).setFilter(filter).setOrderBy(true).sort();
    list.get();
> [2, 4, 6, 8]

Or with objects :

    var list = new BinaryTreeList();
    var filter = function(value){
      if(value.gender !== 'male') return false;
      return true;
    }
    list.push({'name': 'Nicolas', 'gender': 'male'}, {'name': 'John', 'gender': 'male'}, {'name': 'Penelope', 'gender': 'female'});
    list.setFilter(filter).setOrderBy('name').setPagination(3).sort();
    list.get();
> [
>    {
>      name: 'John',
>      gender: 'male'
>    },
>    {
>      name: 'Nicolas',
>      gender: 'male'
>    }
> ]
