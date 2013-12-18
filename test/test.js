var simpleListTest = function(){
    var list = new BinaryTreeList();
    list.push(3).push(2).push(4);

    results.move = true;
    results.paginate = true;
    results.sort = true;
    results.filter = true;

    if(list.get() === 3) results.create = true;

    //simple move
    list.move(1);
    if(list.get() !== 2){
	results.move = false;
	console.error("First move returned the wrong value", list.get());
    }

    //paginate
    list.setPagination(2).sort();
    if(list.get()[1] !== 2){
	results.paginate = false;
	console.error("Pagination returned the wrong value", list.get());
    }
    list.move(1);
    if(list.get()[0] !==4){
	results.move = false;
	console.error("Moving on a paginated list failed", list.get());
    }

    //sort
    list.setOrderBy(true).sort();
    if(list.get()[0] !== 2){
	results.sort = false;
	console.error('Sorting a simple list failed', list.get());
    }

    //filter
    list.setFilter(function(value){
	if(value % 2) return false;
	return true;
    }).sort();
    if(list.get()[1] !== 4){
	results.filter = false;
	console.error('The filter test failed', list.get());
    };

    delete list;
};

var objectListTest = function(){
    var list = new BinaryTreeList();
    list.push({ 'id': 2, 'name': 'toto'}).push({ 'id': 3, 'name': 'tata'}).push({ 'id': 1, 'name': 'titi'});

    //simple move
    list.move(1);
    if(list.get().id !== 3){
	results.move = false;
	console.error("Object list move returned the wrong value", list.get());
    }

    //paginate
    list.setPagination(2).sort();
    if(list.get()[1].id !== 3){
	results.paginate = false;
	console.error("Pagination on object list returned the wrong value", list.get());
    }
    list.move(1);
    if(list.get()[0].id !== 1){
	results.move = false;
	console.error("Moving on an object paginated list failed", list.get());
    }

    //sort
    list.setOrderBy('name').sort();
    if(list.get()[0].id !== 3){
	results.sort = false;
	console.error('Sorting a simple list failed', list.get());
    }

    //filter
    list.setFilter(function(value){
	if(value.name !== 'toto') return false;
	return true;
    }).sort();
    if(list.get()[0].id !== 2){
	results.filter = false;
	console.error('The filter test failed', list.get());
    };
};

var results = {
    'create': false,
    'move': false,
    'sort': false,
    'paginate': false,
    'filter': false
};

var parseResults = function(){
    var content = document.getElementById('content');
    for(var label in results){
	var p = document.createElement('p');
	var color = (results[label]) ? 'green': 'red';
	p.setAttribute('style','color:'+color);
	var text = document.createTextNode(label+' : '+results[label]);
	p.appendChild(text);
	content.appendChild(p);
    };
};

(function(){
    try{
	simpleListTest();
	objectListTest();

	parseResults();
	console.log(results);
    }
    catch(e){
	console.log(e);
    }
})();
