# gamma-grid
A convention-based grid framework that takes an array of JSON objects and displays them in a grid.  Includes support for searching, sorting, paging, cell templates for each column, and selecting one or more objects to perform some action on.

## Dependencies
- [JQuery](https://jquery.com/)
- [mustache.js](https://github.com/janl/mustache.js/)

## Usage
Include JQuery and mustache.js
```javascript
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.3.0/mustache.min.js"></script>
```
Download gamma-grid and include dist/gamma-grid.min.js
```javascript
<script src="pathToGammaGrid/dist/gamma-grid.min.js"></script>
```
Add a div to your html where you want the grid to display
```html
<div id="myGrid"></div>
```
Initialize GammaGrid
```javascript
var options = {
    baseUrl: 'someUrlThatReturnsJSON',
    tableClasses: 'table-bordered',
    columns: {
      id: {}, // this will display a checkbox for each item 
      someProperty: { title: 'Some Property', sort: true, template: '<span class="text-nowrap"><span class="expand-collapse-icon glyphicon glyphicon-chevron-right"></span>{{someProperty}}</span>' },
      someOtherProperty: { title: 'Some Other Property', sort: false }
    },
    search: true,
    pageSize: 20,
    actions: {
        "Some Action": function (ids, objs) {
            var self = this;
            if (ids.length === 0) {
                return null;
            }
            return $.ajax({
                url: 'UrlThatDoesSomethingWithTheSelectedIds',
                method: 'post',
                traditional: true,
                data: {
                    ids: Array.prototype.slice.call(ids)
                }
            }).then(
              function () {
                  self.load();
              },
              function (err) {
                  console.log('error', err);
              });
        }
    }
}

$("#grid").gammaGrid(options);
```
## Options
### baseUrl
This is the url that returns a JSON object with the following properties:
- **count:**
   The total count of objects in the datastore.  This is used for paging to show the total count.  
- **start:**
   The number of rows skipped plus 1.  
- **end:**
   The number of rows skipped plus the number of objects in the results array.  
- **sort:**
   The name of the column to sort by.  
- **results:**
   An array of objects that will be displayed in the grid.  
- **columns:** (optional)
   If you need dynamic columns you can return the columns object here instead of defining it in the initialization options.

### columns
A dictionary where the key is the property name you want included in the grid and the value is an object with the following properties:
- **title:**
   The text to be displayed in the column header.  
- **sort:**
   A boolean that indicates if the column should be sortable or not.  
- **template:**
   A mustache.js template to use for displaying the data in this column.  If omitted, the data will be just text inside the td of the table.

 If the columns are omitted and not included in the JSON result, all properties will be displayed in the grid with the property name as the column header.
 
### pageSize
The number of items to show on each page.
### search
A boolean that indicates if the search feature should be enabled.
### tableClasses
Use this if you was to add css classes to the table.
### subRowTemplate
A mustache.js template.  If you include this option, a hidden row will be included under each row that can be used to display addition data that will not fit in the table.
### dataFormatters
A dictionary where the key is the property name that will be formatted and the value is a function that will format that properties data.  The property name and the object are passed to the function.
### actions
A dictionary where the key is the action name that will be displayed in the button and the value is a function that will be run when the button is clicked.  The ids and selectedObjects of each selected row are passed to the action function.
### pager
A function that returns the html to use for the pager.  If omitted, the default pager is used.
### onData
A function that runs once data is returned from the baseUrl.  It passes the JSON object as a parameter.
### afterLoad
A function that runs when the table is finished loading.
