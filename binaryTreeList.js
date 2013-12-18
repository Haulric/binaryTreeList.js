/*
  BSD-2 License
  Copyright (c) 2013, Nicolas Lantoing
  All rights reserved.

  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//Strict mode...
"use strict";

/**
 * Class used to store and organize lists
 * @class
 * @constructor
 * @return this
 */
function BinaryTreeList(){
    this.length = 0;
    this.pageLength = false;
    this.cursor = 0;
    this.elements = [];
    this.list = [];
    this.orderBy = false;
    this.binaryTree = false;
    this.filter = false;

    return this;
}

// Public

/**
 * Set the pagination rule
 * the change will not take effect until this.sort() is called
 * @method
 * @parameter {Number} pageLength Define the size of each page, if set to 0 or false will disable the pagination
 */
BinaryTreeList.prototype.setPagination = function(pageLength){
    if(!pageLength) this.pageLength = false;
    else if(typeof pageLength == 'number')
	this.pageLength = pageLength;
    else
	console.error('[BinaryTreeList] setPagination require a number as parameter.');

    return this;
};

/**
 * Set the orderBy rule for sorting operations
 * @method
 * @parameter {Mixed} key From what we sort the list, can be true (if you are not listing Object) or a property name eitherway
 */
BinaryTreeList.prototype.setOrderBy = function(key){
    if(!key){
	this.orderBy = false;
	return this;
    }
    if(typeof key == 'boolean'){
	if(typeof this.elements[0] != 'object'){
	    this.orderBy = key;
	    return this;
	}
	console.error("[BinaryTreeList] We can't order object directly.");
    }
    if(typeof key == 'string'){
	if(typeof this.elements[0] == 'object'){
	    this.orderBy = key;
	    return this;
	}
	console.error("[BinaryTreeList] Trying to sort by a property name with a string or number list.");
    }

    console.error("[BinaryTreeList] setOrderBy failed.");
    return this;
};

/**
 * Set a filter for custom sorting
 * @method
 * @parameter {Function} filter The filter to use when building this.list.
 */
BinaryTreeList.prototype.setFilter = function(filter){
    if(typeof filter == 'function') this.filter = filter;
    else console.error('[BinaryTreeList] The filter need to be a function.');
    return this;
};

/**
 * Move the cursor
 * @public
 * @param {steps}
 */
BinaryTreeList.prototype.move = function(steps){
    if(this._canMove(steps)){
        this.cursor += steps;
        return this.get();
    }else{
        console.error('[BinaryTreeList] Illegal move');
        return false;
    }
}

/**
 * Build the binary-tree and the sorted list
 * if no this.orderBy is defined, will create the list without changing the insertion order.
 * @public
 * @return This
 */
BinaryTreeList.prototype.sort = function(){
    this.list = [];
    this.length = 0;
    this.cursor = 0;

    var tree = this._buildTree();
    if(tree)
        this._parseTree(tree);
    else
        for(var i = 0, len = this.elements.length; i<len; i++)
	    this._listPush(i);

    return this;
}

/**
 * Get the current element
 * @public
 * @return The current element, can be a value or an array of values if pagination is enabled
 */
BinaryTreeList.prototype.get = function(){
    if(!this.pageLength)
        return this.elements[this.list[this.cursor]];

    else{
        var results = [];
        if(this.list.length){
            for(var i = 0;i<this.pageLength;i++)
                if( this.elements[this.list[this.cursor][i]])
                    results.push(this.elements[this.list[this.cursor][i]]);
        }
        if(!results.length) console.warn('[BinaryTreeList] Trying to show an empty list');
        return results;
    }
}

/**
 * Get the first element of the designed pattern from the list
 * @public
 * @param {Mixed} keyword Can be a string or a subobject.
 * @return The element or false if none were found
 */
BinaryTreeList.prototype.getElement = function(keyword){
    var len = this.elements.length;
    while(len){
	len--;
        if(typeof keyword == 'object' && typeof this.elements[i] == 'object'){
            var check = true;
            for(var j in keyword)
                if(this.elements[i][j] != keyword[j]) check = false;
            if(check) return this.elements[i];
        }
        else if(this.elements[i] == keyword) return this.elements[i];
    }
}

/**
 * Add a new element
 * @public
 * @param {Mixed} The element that need to be pushed.
 * @return The offset of the element's page
 */
BinaryTreeList.prototype.push = function(element){
    var offset = this.elements.push(element);
    offset--;
    if(!this.binaryTree)
        this._listPush(offset);
    else{
        this._growTree(this.binaryTree, offset);
        this.list = [];
        this.length = 0;
        this._parseTree(this.binaryTree);
    }
    return this;
}

/**
 * Flush the current list
 * @public
 * @return this
 */
BinaryTreeList.prototype.flush = function(){
    this.elements = [];
    this.cursor = 0;
    this.length = 0;
    this.list = [];
    this.binaryTree = false;
    return this;
}

/**
 * Count the number of iterations of an element
 * @public
 * @param {Mixed} keyword Can be a value or an object property name.
 * @return The number of elements found
 */
BinaryTreeList.prototype.countElement = function(keyword){
    var number = 0, len = this.elements.length, check;

    while(len){
	len--;
        check = false;
        if(typeof keyword == 'object' && typeof this.elements[len] == 'object'){
            check = true;
            for(var j in keyword)
                if(this.elements[len][j] !== keyword[j]) check = false;
        }
        else if(this.elements[len] === keyword) check = true;
        if(check) number++;
    }

    return number;
}

/**
 * Return the total number of elements regardless of the pagination.
 * @public
 * @return The number of elemenets.
 */
BinaryTreeList.prototype.countAll = function(){
    if(!this.pageLength) return this.length;
    return this.length * this.pageLength;
}

// Privates
/**
 * Build the binary-tree
 * @private
 * @return The builded tree.
 */
BinaryTreeList.prototype._buildTree = function(){
    //If no orderBy is defined return false
    if(!this.orderBy)
        return false;

    // flush and build the binary tree
    this.binaryTree = false;
    for(var i = 0, len = this.elements.length; i<len; i++)
        this._growTree(this.binaryTree, i);

    return this.binaryTree;
}

/**
 * Recursive function, will parse the tree and append the new element when it reach a leaf
 * @private
 * @param {Mixed} parent The current growing location
 * @param {Number} offset The element position offset in this.elements
 */
BinaryTreeList.prototype._growTree = function(parent,offset){
    //If a filter is defined, use it.
    if(typeof(this.filter) === 'function'){
        if(!this.filter(this.elements[offset])) return this;
    }

    //if this is the first leaf, create the root.
    if(!this.binaryTree){
        this.binaryTree = {
            'initialized': true,
            'offset': offset,
            'left': null,
            'right': null
        };
        return this;
    }

    var parentValue, elementValue;
    if(typeof this.orderBy == 'boolean'){
	parentValue = this.elements[parent.offset];
	elementValue = this.elements[offset];
    }else{
	parentValue = this.elements[parent.offset][this.orderBy];
	elementValue = this.elements[offset][this.orderBy];
    }

    if(parentValue > elementValue){
        if(!parent.left){
            parent.left = {
                'offset': offset,
                left: null,
                right: null,
            };
        }else
            this._growTree(parent.left,offset);
    }
    else{
        if(!parent.right){
            parent.right = {
                'offset': offset,
                'left': null,
                'right': null
            };
        }else
            this._growTree(parent.right,offset);
    }
}

/**
 * Parse recursively the binary-tree
 * @private
 * @param {Object} parent The current parsing location
 * @return this
 */
BinaryTreeList.prototype._parseTree = function(parent){
    if(parent.left)
        this._parseTree(parent.left);

    this._listPush(parent.offset);
    if(parent.right)
        this._parseTree(parent.right);

    return this;
}

/**
 * Add an element's offset to this.list
 * @private
 * @param {Number} offset The element's offset.
 */
BinaryTreeList.prototype._listPush = function(offset){
    //if no pagination just push it
    if(!this.pageLength){
        this.list.push(offset);
        this.length++;
        return true;
    }

    //eitherway fill the page or create a new one.
    var lastEntry = this.list[this.length - 1];
    if(lastEntry && lastEntry.length < this.pageLength){
        lastEntry.push(offset);
    }else{
        this.list.push([offset]);
        this.length++;
    }
}

/**
 * Check if the cursor can move.
 * @private
 * @param {Number} destination The aimed destination.
 * @return True if it can, false eitherway.
 */
BinaryTreeList.prototype._canMove = function(destination){
    var target = this.cursor + destination;
    if(target > this.length )
        return false;
    else if(target < 0)
        return false;
    else
        return true;
}
