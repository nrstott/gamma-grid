(function( $ ) {


  $.fn.gammaGrid = function(options) {

    function hashToQuery(hash){
      var query = "";
      for(var key in hash){
        if (key){
          query += encodeURIComponent(key) + "=" + encodeURIComponent(hash[key]) + "&";  
        }
      }
      return "?" + query;
    }
    function queryToHash(query){
      query = query.substring(1);
      var hash = {};
      var pairs = query.split("&");
      for(var i=0; i< pairs.length; i++){
        var pair = pairs[i].split("=");
        hash[pair[0]] = pair[1];
      }
      return hash;
    }
   var grid = this;
   $(grid).addClass("gammaGrid");
   //init data 
   var dataUrl = options.baseUrl;
   var pager = options.pager || function(start, end, count, queryHash ){
    queryHash.skip = end;
    queryHash.take = options.pageSize;
    var next = (end < count) ? "<a href='" + hashToQuery(queryHash) +"'>Next&nbsp;&mdash;&gt;</a>" : "";
    queryHash.skip = start - options.pageSize -1 ;     
    queryHash.skip = queryHash.skip < 0   ? 0 : queryHash.skip;
    var prev = start !==1    ? "<a href='" + hashToQuery(queryHash)+ "'>&lt;&mdash;&nbsp;Previous </a>" : "";
    return "<div class='gammaPager'>" + prev + " Showing " + start + " to " + end + " of " + count + next + "<div>";
   };
   var query = window.location.search;
   var dataFormatters = options.dataFormatters || {};
   var columns = options.columns;
   var dataHash = {};

   var context = {};
   context.load = function(query){
     var queryHash = queryToHash(query);

     grid.html(""); //wipe the grid.
     $.ajax(dataUrl + query , {method:"GET", dataType:"json", cache:false, success:function(result){
     var data = result.results;
     var isHeader = true;
     var tbl = $("<table class='gammaGridTable' />");
     for (var i = 0; i< data.length; i++){
       if (data[i].id){
         dataHash[data[i].id] = data[i];
       }
       var alternate = "odd";
       if (i %2  == 0) { alternate = "even";} 
       var tr = $("<tr class='gammaGridRow " + alternate + "' />");
       var obj = data[i];
       columns = columns || obj; //if no columns are set then assume them all.
       if (isHeader){
        var thead = $("<thead />");
        for (var key in columns){
          if (key == "id"){ 
            var headerRow =  $("<th class='gammaGridColumnHeader'></th>");
            var selectAll = $("<input type='checkbox' class='gammaSelectAll' />");
            selectAll.click(function(){
              $(".gammaId").prop("checked", this.checked);
              if (this.checked){
                $("tr.gammaGridRow", tbl).addClass("selected");
              }else{
                $("tr.gammaGridRow", tbl).removeClass("selected");
              }                  
            })
            headerRow.append(selectAll);            
            tr.append(headerRow);
          }else{
            var shouldSort = columns[key].sort ? columns[key].sort : false;
            shouldSort &= result.sort !== key;            
            var titleContents = columns[key].title || key;
            if (shouldSort){
              titleContents = $("<a class='gammaSort' href='?sort=" + encodeURIComponent(key) + "'>" + titleContents + "</a>"); 
              titleContents.click(function(){
                var tmpQuery = this.href.substring(this.href.lastIndexOf("/") + 1);
                queryHash = queryToHash(tmpQuery);
                queryHash.skip = 0;
                queryHash.take = options.pageSize;
                context.load(tmpQuery);
                return false;
              })             
            }
            var th = $("<th class='gammaGridColumnHeader' ></th>");
            if (key == result.sort){
                th.addClass("currentSort");                 
            }

            th.append(titleContents);
            tr.append(th);
          }
         }
         thead.append(tr);
         tbl.append(thead);
         isHeader = false;
         tr = $("<tr class='gammaGridRow' />");
       }
      for (var key in columns){
        var td;
        if (key == "id"){
            var chkbox = $("<input type='checkbox' class='gammaId' value='" +obj[key]+ "' />");
            chkbox.click(function(){
              var selectedBox = $(this);
              if (selectedBox.attr('checked')){
                selectedBox.parent().parent().addClass("selected");  
              }else{
                selectedBox.parent().parent().removeClass("selected");  
              }
              
            });
          td = $("<td class='gammaGridColumnData' ></td>"); 
          td.append(chkbox);
        }else{
           var formattedData = dataFormatters[key] ? dataFormatters[key](obj[key]) : obj[key];
           td = $("<td class='gammaGridColumnData' >" + formattedData + "</td>");  
        }
         if (key == result.sort){
          td.addClass("currentSort");                 
         }
         tr.append(td);
       }
       tbl.append(tr);
     }
     grid.append(tbl);
     grid.append(pager(result.start, result.end, result.count, queryHash)) 

   var actionCollection = $("<div class='actionCollection' />");
    for(var action in options.actions){
     var btn = $("<input type='button' class='gammaId' value='" + action + "' />");
     actionCollection.append(btn)
     btn.click(function(){
       var selectedObjects = [];
       var ids = $(".gammaId:checked", grid).map(function(){ 
         selectedObjects.push(dataHash[this.value]);
         return this.value;             
       });           
       options.actions[action].call(context, ids, selectedObjects);
     });
     //todo add menu logic if there are nested keys 
   }
   grid.prepend(actionCollection);
   }, error:function(err){
     alert("An error occurred");
   }})
  }; //end of content.load
  context.load(query);
  }; //end of gamma grid
})( jQuery );


