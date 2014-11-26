  /* Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

  (function($) {
      $.fn.gammaGrid = function(options, cb) {
          if (!Object.keys) {
              Object.keys = function(obj) {
                  var keys = [],
                      k;
                  for (k in obj) {
                      if (Object.prototype.hasOwnProperty.call(obj, k)) {
                          keys.push(k);
                      }
                  }
                  return keys;
              };
          }

          function hashToQuery(hash) {
              var query = "";
              for (var key in hash) {
                  if (key) {
                      query += encodeURIComponent(key) + "=" + encodeURIComponent(hash[key]) + "&";
                  }
              }
              if (query.lastIndexOf("&") == query.length-1){
                query = query.substring(0, query.length-1);
              }
              return  query;
          }

          function queryToHash(query) {
              if (query.indexOf("?") === 0){
                query = query.substring(1);   
              }
              var hash = {};
              var pairs = query.split("&");
              for (var i = 0; i < pairs.length; i++) {
                  var pair = pairs[i].split("=");
                  hash[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]).replace("+", " ");
              }
              return hash;
          }
          var grid = this;
          var context = {};
          var body = $("body");
          grid.addClass("gammaGrid");
          //init data 

          var dataUrl = options.baseUrl.indexOf("?") > -1 ?  options.baseUrl.substring(0,options.baseUrl.indexOf("?")) : options.baseUrl;
          var pager = options.pager || function(start, end, count, queryHash) {
                  queryHash.skip = end;
                  var next = (end < count) ? "<a href='?" + hashToQuery(queryHash) + "'>Next&nbsp;&mdash;&gt;</a>" : "";
                  queryHash.skip = start - options.pageSize - 1;
                  queryHash.skip = queryHash.skip < 0 ? 0 : queryHash.skip;
                  var prev = start !== 1 ? "<a href='?" + hashToQuery(queryHash) + "'>&lt;&mdash;&nbsp;Previous </a>" : "";
                  if (end == 0) {
                      return "<div class='gammaPager'>No Results</div>";
                  } else {
                      return "<div class='gammaPager'>" + prev + " Showing " + start + " to " + end + " of " + count + next + "</div>";
                  }
              };
          var query = window.location.search;

          var dataFormatters = options.dataFormatters || {};
          var columns = options.columns;
          var dataHash = {};


          context.load = function(query) {
              query = query || window.location.search;
              query = query.replace("?", "");
              var queryHash = queryToHash(query);
              queryHash.take = options.pageSize;
              var initialOptions = options.baseUrl.indexOf("?") > -1 ? options.baseUrl.substring(options.baseUrl.indexOf("?")): "";
              if (initialOptions){
                var originalOptions = queryToHash(initialOptions)
                for(var key in originalOptions)
                {
                   if (!queryHash[key]){
                    queryHash[key] = originalOptions[key];
                   }
                }
              }
              query = hashToQuery(queryHash);

              //ajax loading
              var loadingDiv = $("<div class='loading' />");
              grid.html("")
              grid.append(loadingDiv);
              var url = dataUrl + (dataUrl.indexOf("?") > -1 ? "&" + query : "?" + query);
              $.ajax(url, {
                  method: "GET",
                  dataType: "json",
                  cache: false,
                  success: function(result) {
              	      if (options.onData){
			options.onData(result);
		      }
		      grid.html("");
                      var data = result.results;
                      context.count = result.count;
                      context.start = result.start;
                      context.end = result.end;

                      if (options.search) {
                          var searchValue = "";
                          if (queryHash['search']) {
                              searchValue = " value='" + decodeURIComponent(queryHash['search']) + "'";
                          }
                          $(document).on('click', '.gammaSearch .clearText', function() {
                              $(this).parent().find('input').val('');
                              delete queryHash['search'];
                              query = hashToQuery(queryHash);
                              window.location.search = query;
                              context.load(query);
                          });
                          grid.html("<form class='gammaSearch'><input type='text' name='search'" + searchValue + " placeholder='Search...' class='gammaSearchField'/><span class='clearText'>x</span></form>");
                      }

                      var isHeader = true;
                      var tbl = $("<table class='gammaGridTable' />");
                      for (var i = 0; i < data.length; i++) {
                          if (data[i].id) {
                              dataHash[data[i].id] = data[i];
                          }
                          var alternate = "odd";
                          if (i % 2 == 0) {
                              alternate = "even";
                          }
                          var tr = $("<tr class='gammaGridRow " + alternate + "' />");
                          var obj = data[i];
                          columns = columns || obj; //if no columns are set then assume them all.
                          if (isHeader) {
                              var thead = $("<thead />");
                              for (var key in columns) {
                                  if (key == "_id" || key == "id") {
                                      var headerRow = $("<th id='gammaGridHeader_"+key+"' class='gammaGridColumnHeader'></th>");
                                      var selectAll = $("<input type='checkbox' class='gammaSelectAll' />");

                                      var globalSelectAll = $("<input type='hidden' value='false' id='globalSelectAll'/>");
                                      var globalSelectSpan = $("<span class='globalText'>All items on this page are selected. </span>");
                                      var globalSelectTrigger = $("<a class='globalTrigger' href='javascript:void(0)'>Select all " + context.count + " items.</a>");


                                      globalSelectTrigger.click(function(e) {
                                          e.preventDefault();

                                          if (globalSelectAll.val() === "true") {
                                              context.load();
                                          } else {
                                              globalSelectAll.val("true");
                                              $(".gammaId").attr("disabled", "disabled");
                                              $(".gammaPager a").hide();
                                              globalSelectSpan.text("All " + context.count + " items are selected. ");
                                              globalSelectTrigger.text("");
                                          }

                                      });
                                      var selectAllHeader = $("<th class='gammaSelectAll' colspan='" + Object.keys(columns).length + "'/>").append(selectAll).append(globalSelectSpan).append(globalSelectTrigger).append(globalSelectAll);
                                      var selectAllRow = $("<tr class='gammaSelectAllRow'/>").append(selectAllHeader);
                                      selectAllRow.hide();
                                      thead.append(selectAllRow);

                                      selectAll.change(function() {
                                          var self = $(this);
                                          var checkedItems = $(".gammaId");
                                          checkedItems.prop("checked", self.prop("checked"));
                                          if (this.checked) {
                                              $("tr.gammaGridRow", tbl).addClass("selected");
                                          } else {
                                              $("tr.gammaGridRow", tbl).removeClass("selected");
                                          }

                                          if (this.checked) {
                                              globalSelectSpan.text(checkedItems.length + " items on this page are selected.");
                                              selectAllRow.show();
                                          } else {
                                              selectAllRow.hide();
                                              globalSelectAll.val("false");
                                              checkedItems.removeAttr("disabled");
                                              $(".gammaPager a").show();
                                          }
                                      });
                                      headerRow.append(selectAll);
                                      tr.append(headerRow);
                                  } else {

                                      var shouldSort = (columns[key] == null) ? false : columns[key].sort ? columns[key].sort : false;
                                      if (shouldSort !== false) {
                                          shouldSort &= result.sort !== key;
                                      }
                                      var titleContents = columns[key] === null ? key : columns[key].title || key;
                                      if (shouldSort) {
                                          titleContents = $("<a class='gammaSort' href='?sort=" + encodeURIComponent(key) + "'>" + titleContents + "</a>");
                                          titleContents.click(function() {
                                              var tmpQuery = this.href.substring(this.href.lastIndexOf("?"));
                                              queryHash = queryToHash(tmpQuery);
                                              queryHash.skip = 0;
                                              queryHash.take = options.pageSize;
                                              context.load(tmpQuery);
                                              return false;
                                          })
                                      }
                                      var th = $("<th id='gammaGridHeader_"+key+"' class='gammaGridColumnHeader' ></th>");
                                      if (key == result.sort) {
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
                          for (var key in columns) {
                              var td;
                              if (key === "_id" || key ==="id") {
                                  var chkbox = $("<input type='checkbox' class='gammaId' value='" + obj[key] + "' />");
                                  chkbox.click(function() {
                                      var selectedBox = $(this);
                                      if (selectedBox.attr('checked')) {
                                          selectedBox.parent().parent().addClass("selected");
                                      } else {
                                          selectedBox.parent().parent().removeClass("selected");
                                      }

                                  });
                                  td = $("<td class='gammaGridColumnData' ></td>");
                                  td.append(chkbox);
                              } else {
                                  var formattedData = dataFormatters[key] ? dataFormatters[key](obj[key], obj) : obj[key];
                                  if (!formattedData) {
                                      formattedData = '';
                                  }
                                  if (columns[key].isLink) {
                                      var href = columns[key].href;
                                      href.match(/{{\s*[\w\.]+\s*}}/g).map(function(str) {
                                          var field = str.substring(2, str.length - 2);
                                          var value = obj[field];
                                          href = href.replace(str, value);
                                      });
                                      td = $("<td class='gammaGridColumnData' ><a href='" + href + "'>" + formattedData + "</a></td>");
                                  } else {
                                      if (columns[key].template) {
                                          if (typeof Mustache === "undefined") {
                                              console.error("Mustache is required in order to use the template option")
                                          } else {
                                              formattedData = Mustache.render(columns[key].template, obj);
                                          }
                                      }
                                      td = $("<td class='gammaGridColumnData' >" + formattedData + "</td>");
                                  }
                              }
                              if (key == result.sort) {
                                  td.addClass("currentSort");
                              }
                              tr.append(td);
                          }
                          tbl.append(tr);
                      }
                      grid.append(tbl);
                      grid.append(pager(result.start, result.end, result.count, queryHash))

                      var actionCollection = $("<div class='actionCollection' />");
                      var globalSelectAll = $("#globalSelectAll");

                      if (options.actions) {
                          $.each(options.actions, function(label, action) {
                              var btn = $("<input type='button' value='" + label + "' />");
                              actionCollection.append(btn)
                              btn.click(function() {

                                  var selectedObjects = [];
                                  var ids = globalSelectAll.val() === "true" ? "*" : $(".gammaId:checked", grid).map(function() {
                                      selectedObjects.push(dataHash[this.value]);
                                      return this.value;
                                  });
                                  action.call(context, ids, selectedObjects);
                              });
                              //todo add menu logic if there are nested keys 
                          });
                      }

                      grid.prepend(actionCollection);
                      if (options.afterLoad) {
                          options.afterLoad.call(context);
                      }
                  },
                  error: function(err) {
                      console.error("An error occurred during api call", err)
                  }
              })
          }; //end of content.load
          context.load(query);
      }; //end of gamma grid

  })(jQuery);
