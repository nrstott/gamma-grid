(function( $ ) {


  $.fn.gammaGrid = function(options) {
       var grid = this;
   //init data 
   var dataUrl = options.baseUrl;
   var pager = options.pager || function(start, end, count ){
    return "<div class='gammaPager'>Showing " + start + " to " + end + " of " + count +"<div>";
   };
   var query = window.location.search;
   var dataFormatters = options.dataFormatters || {};
   var columns = options.columns;
   var dataHash = {};

   var context = {};
   context.load = function(query){
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
                context.load(this.href.substring(this.href.lastIndexOf("/") + 1));
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
         isHeader = false;
         tbl.append(tr);
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
     grid.append(pager(result.start, result.end, result.count)) 

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


