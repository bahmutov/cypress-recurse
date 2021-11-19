/**

jQuery Plugin
Name: tableManager
Version: 1.1.0
Author: Pietrantonio Alessandro (Stone)
Author's website: http://www.stonewebdesign.it

@-- What's new --@

1)
    New classes to the table: tablePagination, tableFilterBy;

2)
    New class to the th element: disableFilterBy;

3)
    New option to disable filter on one or more column: disableFilterBy: []

@-- Usage --@

Important! This plugin NEED jQuery library to work. As a matter of fact it's a jQuery plugin.

Minimum requirements:
-   jQuery library

1)
    To include jQuery library download it from jQuery site and put the .js file into your site folders, then put this line into your document:
    <script type="text/javascript" src="PATH_TO_YOUR_FILE/jquery-VERSION_NUMBER.min.js"></script>
    Alternatively you can include it without download it, just like this:
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
2)
    Include this plugin just like this: download it and put the .js file into your site folders, then write this line into your document:
    <script type="text/javascript" src="PATH_TO_YOUR_FILE/tableManager.js"></script>
    Important! REMEMBER: THIS LINE HAVE TO BE AFTER JQUERY INCLUDING LINE!


If you want you can customize this plugin as you prefer and need just with the following options.
Options:

    debug = (boolean) can be true or false or not set. It activates debug mode and show messages into browser console.

    firstSort = can be an array of integer, or just a single integer. The first parameter determines the number of column to start sorting, the second parameter determines the order (asc or 0 = ascending, desc or 1 = descending). Ex.:
        firstSort : [[1,'asc']] --> the table is sorted by first column (first parameter = 1), by ascending order (second parameter = 0).

    disable = this option is used to disable one or more columns and expect one parameter per column. The parameter can be an integer or, to disable last column, -1 or the word "last". Ex.:
        disable : [3] --> disable sorting on third column

    appendFilterby = (boolean) used to add a filter on top of the table. The filter will be composed by one select to select by which column to filter and an input text to filter typing. Ex.:
        appendFilterby : true

    dateFormat = used to indicate column and dateformat. It helps to sort by date which is formatted like dd-mm-yyyy or mmddyyyy. The first parameter is the column, the second parameter is date format. Ex.:
        dateFormat : [[3, 'dd-mm-yyyy']] --> the third column is date and it's formatted like dd-mm-yyyy

    pagination = true or false or not set. It permits to paginate table and append controllers under the table. Ex.:
        pagination : true --> enable pagination tool

    showrows = you can append to table a select by which you can select number of rows to show. It must be an array of numbers. Ex.:
        showrows : [10,100,1000] --> you can choose to show 10, 100, 1000 rows

    vocabulary = used to translate labels. The following are accepted labels:
        voc_filter_by
        voc_type_here_filter

    disableFilterBy = used to disable filter by specific columns. It must be an array of numbers. To disable filter by last column you can use "last". Ex.:
        disableFilterBy: [1, "last"] --> it disable filter by first and last column

Classes:

    (th)        disableSort = disable that specific column
                disableFilterBy = disable filter for that specific column

    (table)     tablePagination = append pagination elements to table
                tableFilterBy = append filter tool to table

Data- attributes:

    data-tablemanager =
        'disable' --> disable that specific column

        '{"dateFormat":"dd-mm-yyyy"}' --> this secific column represent a date with the forma tdd-mm-yyyy (Important! To pass correctly this data attribute the attribute value has to be written between '' and attribute single elements like dateFormat or mm-dd-yyyy between "")


Important! Do not edit this plugin if you're not sure you're doing it right. The Author is not responsible for any malfunctions caused by the end User.

**/

;(function ($) {
  /* Initialize function */
  $.fn.tablemanager = function (options = null) {
    /**
        Get common variables, parts of tables and others utilities
        **/
    var Table = $(this),
      Heads = $(this).find('thead th'),
      tbody = $(this).find('tbody'),
      rows = $(this).find('tbody tr'),
      rlen = rows.length,
      arr = [],
      cells,
      clen

    /**
        Options default values
        **/
    var firstSort = [[0, 0]],
      dateColumn = [],
      dateFormat = [],
      disableFilterBy = []

    /**
        Debug value true or false
        **/
    var debug = false
    var debug = options !== null && options.debug == true ? true : false

    /**
        Set pagination true or false
        **/
    var pagination = false
    pagination = options !== null && options.pagination == true ? true : false
    // default pagination variables
    var currentPage = 0
    var numPerPage =
      pagination !== true && showrows_option !== true ? rows.length : 5
    var numOfPages =
      options.numOfPages !== undefined && options.numOfPages > 0
        ? options.numOfPages
        : 5

    /**
        Set default show rows list or set if option is set
        **/
    var showrows = [5, 10, 50]
    showrows =
      options !== null &&
      options.showrows != '' &&
      typeof options.showrows !== undefined &&
      options.showrows !== undefined
        ? options.showrows
        : showrows

    /**
        Default labels translations
        **/
    var voc_filter_by = 'Filter by',
      voc_type_here_filter = 'Type here to filter...',
      voc_show_rows = 'Show rows'

    /**
        Available options:
        **/
    var availableOptions = new Array()
    availableOptions = [
      'debug',
      'firstSort',
      'disable',
      'appendFilterby',
      'dateFormat',
      'pagination',
      'showrows',
      'vocabulary',
      'disableFilterBy',
      'numOfPages',
    ]

    // debug
    // make array form options object
    arrayOptions = $.map(options, function (value, index) {
      return [index]
    })
    for (i = 0; i < arrayOptions.length; i++) {
      // check if options are in available options array
      if (availableOptions.indexOf(arrayOptions[i]) === -1) {
        if (debug) {
          cLog('Error! ' + arrayOptions[i] + ' is unavailable option.')
        }
      }
    }

    /**
        Get options if set
        **/
    if (options !== null) {
      /**
            Check options vocabulary
            **/
      if (
        options.vocabulary != '' &&
        typeof options.vocabulary !== undefined &&
        options.vocabulary !== undefined
      ) {
        // Check every single label

        voc_filter_by =
          options.vocabulary.voc_filter_by != '' &&
          options.vocabulary.voc_filter_by !== undefined
            ? options.vocabulary.voc_filter_by
            : voc_filter_by

        voc_type_here_filter =
          options.vocabulary.voc_type_here_filter != '' &&
          options.vocabulary.voc_type_here_filter !== undefined
            ? options.vocabulary.voc_type_here_filter
            : voc_type_here_filter

        voc_show_rows =
          options.vocabulary.voc_show_rows != '' &&
          options.vocabulary.voc_show_rows !== undefined
            ? options.vocabulary.voc_show_rows
            : voc_show_rows
      }

      /**
            Option disable
            **/
      if (
        options.disable != '' &&
        typeof options.disable !== undefined &&
        options.disable !== undefined
      ) {
        for (var i = 0; i < options.disable.length; i++) {
          // check if should be disabled last column
          col =
            options.disable[i] == -1 || options.disable[i] == 'last'
              ? Heads.length
              : options.disable[i] == 'first'
              ? 1
              : options.disable[i]
          Heads.eq(col - 1)
            .addClass('disableSort')
            .removeClass('sortingAsc')
            .removeClass('sortingDesc')

          // debug
          if (isNaN(col - 1)) {
            if (debug) {
              cLog('Error! Check your "disable" option.')
            }
          }
        }
      }

      /**
            Option select number of rows to show
            **/
      var showrows_option = false
      if (
        options.showrows != '' &&
        typeof options.showrows !== undefined &&
        options.showrows !== undefined
      ) {
        showrows_option = true

        // div num rows
        var numrowsDiv =
          '<div id="for_numrows" class="for_numrows" style="display: inline;"><label for="numrows">' +
          translate(voc_show_rows) +
          ': </label><select id="numrows"></select></div>'
        // append div to choose num rows to show
        Table.before(numrowsDiv)
        // get show rows options and append select to its div
        for (i = 0; i < showrows.length; i++) {
          $('select#numrows').append(
            $('<option>', {
              value: showrows[i],
              text: showrows[i],
            }),
          )

          // debug
          if (isNaN(showrows[i])) {
            if (debug) {
              cLog('Error! One of your "show rows" options is not a number.')
            }
          }
        }

        var selectNumRowsVal = $('select#numrows').val()
        numPerPage = selectNumRowsVal
        // on select num rows change get value and call function
        $('select#numrows').on('change', function () {
          selectNumRowsVal = $(this).val()
          // reset current page to show always first page if select change
          currentPage = 0
          generatePaginationValues()
        })
      }

      /**
            Pagination
            **/
      if (pagination === true || Table.hasClass('tablePagination')) {
        var numPages = Math.ceil(rows.length / numPerPage)

        // append num pages on bottom
        var pagesDiv =
          '<div id="pagesControllers" class="pagesControllers"></div>'
        Table.after(pagesDiv)

        // Showrows option and append
        // If showrows is set get select val
        if (showrows_option !== true) {
          var selectNumRowsVal = numPerPage
        }

        generatePaginationValues()
      }

      /**
            Check if disable filter by is empty or undefined
            **/
      if (
        options.disableFilterBy != '' &&
        typeof options.disableFilterBy !== undefined &&
        options.disableFilterBy !== undefined
      ) {
        for (var i = 0; i < options.disableFilterBy.length; i++) {
          // check if should be disabled last column
          col =
            options.disableFilterBy[i] == -1 ||
            options.disableFilterBy[i] == 'last'
              ? Heads.length
              : options.disableFilterBy[i] == 'first'
              ? 1
              : options.disableFilterBy[i]
          Heads.eq(col - 1).addClass('disableFilterBy')

          // debug
          if (isNaN(col - 1)) {
            if (debug) {
              cLog('Error! Check your "disableFilterBy" option.')
            }
          }
        }
      }

      /**
            Append filter option
            **/
      if (options.appendFilterby === true || Table.hasClass('tableFilterBy')) {
        // Create div and select to filter
        var filterbyDiv =
          '<div id="for_filter_by" class="for_filter_by" style="display: inline;"><label for="filter_by">' +
          translate(voc_filter_by) +
          ': </label><select id="filter_by"></select> <input id="filter_input" type="text" placeholder="' +
          translate(voc_type_here_filter) +
          '"></div>'
        $(this).before(filterbyDiv)

        // Populate select with every th text and as value use column number
        $(Heads).each(function (i) {
          if (!$(this).hasClass('disableFilterBy')) {
            $('select#filter_by').append(
              $('<option>', {
                value: i,
                text: $(this).text(),
              }),
            )
          }
        })

        // Filter on typing selecting column by select #filter_by
        $('input#filter_input').on('keyup', function () {
          var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase()
          var select_by = $('select#filter_by').val()

          Table.find('tbody tr')
            .show()
            .filter(function () {
              // search into column selected by #filter_by
              var text = $(this)
                .find('td:eq(' + select_by + ')')
                .text()
                .replace(/\s+/g, ' ')
                .toLowerCase()
              return !~text.indexOf(val)
            })
            .hide()

          if (val == '') paginate()
        })
      }

      /**
            Date format option
            **/
      if (
        options.dateFormat != '' &&
        typeof options.dateFormat !== undefined &&
        options.dateFormat !== undefined
      ) {
        for (i = 0; i < options.dateFormat.length; i++) {
          dateColumn.push(options.dateFormat[i][0] - 1)
          dateFormat.push([
            options.dateFormat[i][0] - 1,
            options.dateFormat[i][1],
          ])
        }
        // check if column has table manager data attribute
        Heads.each(function (col) {
          if (
            $(this).data('tablemanager') &&
            $(this).data('tablemanager').dateFormat !== undefined
          ) {
            var dateF = $(this).data('tablemanager').dateFormat
            dateColumn.push(col)
            dateFormat.push([col, dateF])
          }
        })
      }

      /**
            Check if first element to sort is empty or undefined
            **/
      if (
        options.firstSort != '' &&
        typeof options.firstSort !== undefined &&
        options.firstSort !== undefined
      ) {
        var firstSortColumn = []
        var firstSortRules = options.firstSort
        var firstSortOrder = []
        for (i = 0; i < options.firstSort.length; i++) {
          firstSortColumn.push(options.firstSort[i][0])
          firstSortOrder.push(options.firstSort[i][1])
        }
        TableSort(firstSortRules)
      }
    }
    if (debug) {
      cLog('Options set:', options)
    }

    /**
        Detect theads click and sort by that column
        **/
    Heads.each(function (n) {
      // check if has class disableSort or has data-attribute = disable
      var disable =
        $(this).data('tablemanager') === 'disable'
          ? true
          : $(this).hasClass('disableSort')
          ? true
          : false

      if (!disable === true) {
        $(this).on('click', function () {
          setTimeout(function sortIt() {
            if ($(this).hasClass('sortingAsc')) {
              $(Heads).removeClass('sortingAsc').removeClass('sortingDesc')
              $(this).addClass('sortingDesc')
              order = 1
            } else {
              $(Heads).removeClass('sortingDesc').removeClass('sortingAsc')
              $(this).addClass('sortingAsc')
              order = 0
            }
            // TableSort(this, n, order);
            var sortRules = []
            sortRules.push([n + 1, order])
            TableSort(sortRules)
          }, Math.random() * 1000)
        })
        $(this).addClass('sorterHeader')
      }
    })

    /**
        Main function: sort table
        rules = array of column, order
        **/
    function TableSort(rules) {
      cellsArray = []
      for (i = 0; i < rlen; i++) {
        cells = rows[i].cells
        clen = cells.length
        cellsArray[i] = []
        for (j = 0; j < clen; j++) {
          cellsArray[i].push(cells[j].outerHTML)
        }
      }
      // For each firtsort rule
      var firstSortData = []
      for (i = 0; i < rules.length; i++) {
        var col = rules[i][0] - 1
        var thead = Heads.eq(col)
        var order =
          rules[i][1] == undefined
            ? 0
            : rules[i][1] == 0 || rules[i][1] == 'asc'
            ? 0
            : rules[i][1] == 1 || rules[i][1] == 'desc'
            ? 1
            : 0
        // Manage classes asc and desc
        if (i == 0) {
          var firstClassOrder = order == 0 ? 'sortingAsc' : 'sortingDesc'
          $(thead).addClass(firstClassOrder)
        }
        asc = order == 0 ? 1 : -1
        // if column is date
        if (dateColumn.indexOf(col) != -1) {
          for (j = 0; j < dateFormat.length; j++) {
            if (dateFormat[j][0] == col) {
              var type = 'date'
              var format = dateFormat[j][1]
            }
          }
        } else {
          var type = 'alphanumeric'
          var format = null
        }
        firstSortData.push([col, asc, type, format])
      }

      multipleSortCol(cellsArray, firstSortData)

      appendSortedTable(cellsArray)
    }

    /**
        Function which sort columns
        array = what have to be sorted
        data = columns, orders (asc and desc), types(alphanum or date), formats (for dates)
        **/
    function multipleSortCol(array, data) {
      var cols = []
      var orders = []
      var types = []
      var formats = []
      for (i = 0; i < data.length; i++) {
        cols.push(data[i][0])
        orders.push(data[i][1])
        types.push(data[i][2])
        formats.push(data[i][3])
      }
      array.sort(function (a, b) {
        for (i = 0; i < cols.length; i++) {
          // initialize variables
          var first = '',
            second = ''
          var order = orders[i]
          // get inner text from stringified elements
          let firstCol = new DOMParser().parseFromString(
            a[cols[i]],
            'text/html',
          ).documentElement.textContent
          let secondCol = new DOMParser().parseFromString(
            b[cols[i]],
            'text/html',
          ).documentElement.textContent
          // If it's last col selected and a = b return 0
          if (i == cols.length && firstCol == secondCol) {
            return 0
          }
          // check col type if is aplhpanum or date
          if (types[i] == 'alphanumeric') {
            if (firstCol > secondCol) {
              return order
            } else if (firstCol < secondCol) {
              return -1 * order
            }
          } else if (types[i] == 'date') {
            if (
              formatDate(formats[i], firstCol) >
              formatDate(formats[i], secondCol)
            ) {
              return order
            } else if (
              formatDate(formats[i], firstCol) <
              formatDate(formats[i], secondCol)
            ) {
              return -1 * order
            }
          }
        }
      })
    }

    /**
        Append sorted table
        arr = array with table html
        **/
    function appendSortedTable(arr) {
      // create rows and cells by sorted array
      // for(i = 0; i < rlen; i++){
      //     arr[i] = "<td>"+arr[i].join("</td><td>")+"</td>";
      // };
      // reset tbody
      tbody.html('')
      // append new sorted rows
      tbody.html('<tr>' + arr.join('</tr><tr>') + '</tr>')
      // then launch paginate function (if options.paginate = false it will not do anything)
      paginate()
    }

    /**
        Format date
        dateFormat = the date format passed by user
        date = date to format
        **/
    function formatDate(dateFormat, date) {
      var $date = date
      // debug variable
      var format = 0
      if (dateFormat == 'ddmmyyyy') {
        $date = date.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, '$3$2$1')
        format = 1
      }
      if (dateFormat == 'mmddyyyy') {
        $date = date.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, '$3$1$2')
        format = 1
      }
      if (dateFormat == 'dd-mm-yyyy') {
        $date = date.replace(
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          '$3-$2-$1',
        )
        format = 1
      }
      if (dateFormat == 'mm-dd-yyyy') {
        $date = date.replace(
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          '$3-$1-$2',
        )
        format = 1
      }
      if (dateFormat == 'dd/mm/yyyy') {
        $date = date.replace(
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          '$3/$2/$1',
        )
        format = 1
      }
      if (dateFormat == 'mm/dd/yyyy') {
        $date = date.replace(
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          '$3/$1/$2',
        )
        format = 1
      }
      // For debugging
      if (format == 0) {
        if (debug) {
          cLog('Error! Unvalid "date format".')
        }
      }

      return $date
    }

    /**
        Generate page values: if numrows are selected or not it organize every value needed by pagination function and others
        **/
    function generatePaginationValues() {
      // get first select num rows value
      numPerPage = selectNumRowsVal
      numPages = Math.ceil(rows.length / numPerPage)
      // append first controllers for pages
      appendPageControllers(numPages)
      // Give currentPage class to first page number
      $('.pagecontroller-num').eq(0).addClass('currentPage')
      paginate(currentPage, numPerPage)
      pagecontrollersClick()
      filterPages()
    }

    /**
        Pagination function: reorganize entire table by pages
        curPage = (can be null) current page if it's set
        perPage = (can be null) number of rows per page
        **/
    function paginate(curPage = null, perPage = null) {
      var curPage = curPage === null ? currentPage : curPage
      var perPage = perPage === null ? numPerPage : perPage
      Table.on('paginating', function () {
        $(this)
          .find('tbody tr')
          .hide()
          .slice(curPage * perPage, (curPage + 1) * perPage)
          .show()
      })
      Table.trigger('paginating')

      console.log('page %d of %d', curPage, numPages)
      if (curPage === numPages - 1) {
        $('.pagecontroller-n').attr('disabled', 'disabled')
        $('.pagecontroller-l').attr('disabled', 'disabled')
      } else {
        // remove disabled attribute
        $('.pagecontroller-n').removeAttr('disabled')
        $('.pagecontroller-l').removeAttr('disabled')
      }

      if (curPage === 0) {
        $('.pagecontroller-f').attr('disabled', 'disabled')
        $('.pagecontroller-p').attr('disabled', 'disabled')
      } else {
        // remove disabled attribute
        $('.pagecontroller-f').removeAttr('disabled')
        $('.pagecontroller-p').removeAttr('disabled')
      }
    }

    /**
        Page controllers append: generate page controllers and append them on bottom of table
        **/
    function appendPageControllers(nPages) {
      // reset div
      $('#pagesControllers').html('')
      // First
      $('#pagesControllers').append(
        $('<button>', {
          value: 'first',
          text: '<<',
          class: 'pagecontroller pagecontroller-f',
        }),
      )
      // Previous
      $('#pagesControllers').append(
        $('<button>', {
          value: 'prev',
          text: '<',
          class: 'pagecontroller pagecontroller-p',
        }),
      )
      // Numbers
      for (i = 1; i <= nPages; i++) {
        $('#pagesControllers').append(
          $('<button>', {
            value: i,
            text: i,
            class: 'pagecontroller pagecontroller-num',
          }),
        )
      }
      // Next
      $('#pagesControllers').append(
        $('<button>', {
          value: 'next',
          text: '>',
          class: 'pagecontroller pagecontroller-n',
        }),
      )
      // Last
      $('#pagesControllers').append(
        $('<button>', {
          value: 'last',
          text: '>>',
          class: 'pagecontroller pagecontroller-l',
        }),
      )
    }

    /**
        Page controllers click: check if pagecontroller has clicked and change page to view
        **/
    function pagecontrollersClick() {
      $('.pagecontroller').on('click', function () {
        // on click on button do something
        if ($(this).val() == 'first') {
          currentPage = 0
          paginate(currentPage, numPerPage)
        } else if ($(this).val() == 'last') {
          currentPage = numPages - 1
          paginate(currentPage, numPerPage)
        } else if ($(this).val() == 'prev') {
          if (currentPage != 0) {
            currentPage = currentPage - 1
            paginate(currentPage, numPerPage)
          }
        } else if ($(this).val() == 'next') {
          if (currentPage != numPages - 1) {
            currentPage = currentPage + 1
            paginate(currentPage, numPerPage)
          }
        } else {
          currentPage = $(this).val() - 1
          paginate(currentPage, numPerPage)
        }
        // Reset class and give to currentPage
        $('.pagecontroller-num').removeClass('currentPage')
        $('.pagecontroller-num').eq(currentPage).addClass('currentPage')

        filterPages()
      })
    }

    function filterPages() {
      $('.pagecontroller-num')
        .hide()
        .filter(function (i, el) {
          let mid = Math.ceil(numOfPages / 2)
          if (currentPage < mid) {
            if (i < numOfPages) return true
          } else if (currentPage > numPages - (numOfPages - 1)) {
            if (i >= numPages - numOfPages) return true
          } else {
            if (numOfPages % 2 == 0) {
              if (i >= currentPage - mid && i < currentPage + mid) return true
            } else {
              if (i > currentPage - mid && i < currentPage + mid) return true
            }
          }
        })
        .show()
    }

    /**
        Translating function
        string = string to be translated
        **/
    function translate(string) {
      return string
    }

    /**
        Debug function
        name = label for data
        string = string to pass by console.log
        **/
    function cLog(name, string = null) {
      console.log(name)
      if (string != null) {
        console.log(JSON.parse(JSON.stringify(string)))
      }
    }
  }
})(jQuery)
