let referenceList = [];
let currentID = '';

// on any page load
$(window).on('load', function () {

  // on about page load
  if (top.location.pathname === '/') {
    getVerseOfDay();
  }

  // on new entries page load
  if (top.location.pathname === '/new_entry.html') {
    loadBooks();
  }

  // on entries page load
  if (top.location.pathname === '/entries.html') {
    if(localStorage.getItem('ID')){
      currentID = localStorage.getItem('ID')
      return loadSpecificEntry();
    }
    displayLogs();
  }

  // on edit entries page load
  if (top.location.pathname === '/edit_entry.html') {
    currentID = localStorage.getItem('ID')
    onLandingEditPage();
  }
})

// on sign in click
$('#signIn').click(async (e) => {
  e.preventDefault();
  window.location = '/';
})

// on start button click
$('#startButton').click(async (e) => {
  e.preventDefault();
  window.location = '/new_entry.html';
})

const getVerseOfDay = (() => {
  const VERSES = [
    `JER.29.11`,
    `ISA.9.6`,
    `ISA.40.28`,
    `PHP.4.13`,
    `JHN.3.16`,
    `ROM.8.28`,
    `ISA.41.10`,
    `PSA.46.1`,
    `GAL.5.22-23`,
    `HEB.11.1`,
    `2TI.1.7`,
    `1COR.10.13`,
    `PRO.22.6`,
    `ISA.40.31`,
    `JOS.1.9`,
    `HEB.12.2`,
    `MAT.11.28`,
    `ROM.10.9-10`,
    `PHP.2.3-4`,
    `MAT.5.43-44`,
    `GEN.1.1`,
    `ROM.3.23`,
    `NEH.6.3`,
    `COL.3.5`,
    `COL.4.5`,
    `GAL.6.9`,
    `REV.3.20`,
    `PSA.27.1`,
    `HEB.13.8`,
    `COL.3.23`
  ];

  const verseIndex = Math.floor(Math.random() * VERSES.length);
  const verseID = VERSES[verseIndex];

  $.ajax({
    url: '/web/verse-of-day/' + verseID,
    type: 'GET',
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    success: (data) => {
      $('#verseOfDay').html(data.passages[0].content +  ` ${data.passages[0].reference}`);
    },
  });
})

const loadBooks = (() => {
  // Load first select
  $('#bookSelect').append($('<option>', {
    value: 'Book',
    text: 'Book'
  }));

  // display all books
  $.ajax({
    url: '/web/books/',
    type: 'GET',
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    success: (data) => {
      $.each(data, function (i, item) {
        $('#bookSelect').append($('<option>', {
          value: item.id,
          text: item.name
        }));
      });
    },
  });
})

// once book selected, display chapters
$('#bookSelect').on('change', function () {
  if (!this.value) {
    return;
  }
  $('#chapterSelect').empty()
  $('#verseSelect').empty()
  $('#verse2Select').empty()

  $('#chapterSelect').append($(
    '<option>',
    {
      value: 'Chapter',
      text: 'Chapter'
    }));
  $.ajax({
    url: '/web/' + this.value,
    type: 'GET',
    dataType: 'json',
    success: (data) => {
      // remove intro chapter
      $.each(data, function (i, item) {
        if (item.number !== 'intro') {
          $('#chapterSelect').append($('<option>', {
            value: item.number,
            text: item.number
          }));
        }
      });
    },
  });
});

// once chapter selected, display verse
$('#chapterSelect').on('change', function () {
  var book = $('#bookSelect').find(":selected").val();
  var chapter = $('#chapterSelect').find(":selected").text();
  $('#verseSelect').empty()
  $('#verse2Select').empty()

  $('#verseSelect').append($('<option>', {
    value: 'Verse',
    text: 'Verse'
  }));
  $.ajax({
    url: '/web/' + book + '/' + chapter,
    type: 'GET',
    dataType: 'json',
    success: (data) => {
      $.each(data, function (i, item) {
        item = item.reference.split(':')[1];
        $('#verseSelect').append(
          $('<option>',
            {
              value: item,
              text: item
            }));
      });
    },
  });
});

// once verse1 selected, limit verse2 options
$('#verseSelect').on('change', function () {
  var book = $('#bookSelect').find(":selected").val();
  var chapter = $('#chapterSelect').find(":selected").text();
  var verse1 = $('#verseSelect').find(":selected").text();
  $('#verse2Select').empty()

  $('#verse2Select').append(
    $('<option>',
      {
        value: 'Verse',
        text: 'Verse'
      }));

  $.ajax({
    url: '/web/' + book + '/' + chapter,
    type: 'GET',
    dataType: 'json',
    success: (data) => {
      $.each(data, function (i, item) {
        item = item.reference.split(':')[1];
        if (parseInt(item) >= parseInt(verse1)) {
          $('#verse2Select').append(
            $('<option>',
              {
                value: item,
                text: item
              }));
        }
      });
    },
  });
});

// on append to verse button click
$('#appendToVerse').click((e) => {
  e.preventDefault();
  var book = $('#bookSelect').find(":selected").val();
  var bookTxt = $('#bookSelect').find(":selected").text();
  var chapter = $('#chapterSelect').find(":selected").text();
  var verse = $('#verseSelect').find(":selected").val();
  var verse2 = $('#verse2Select').find(":selected").val();

  if (book == null || chapter == null || verse == null || verse2 == null) {
    const msg = 'Please select book, chapter and verses'
    const alertMsg = '<div id="successAlert" class="alert alert-warning alert-dismissible fade show" role="alert">' +
        `<strong>Error! </strong> ${msg}` +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button></div>'
      $('#main').append(alertMsg)

      $(".alert").delay(3000).slideUp(200, function () {
        $(this).alert('close');
      });
  }
  $.ajax({
    url: '/web/passage/' + book + '/' + chapter + '/' + verse + '/' + verse2,
    type: 'GET',
  })
    .done((data) => {
      referenceList.push({ bookId: book, bookName: bookTxt, chapter, verses: `${verse}-${verse2}`, reference: data.reference });
      let referencesTxt = `&nbsp;<label>${data.reference}&nbsp;|</label>`;
      $('#customText').append(data.content + ' (' + data.reference + ')<br/><br/>')
      $('#referencesDiv').append(referencesTxt);
    })
})

// on clear verse button click
$('#clearVerse').click((e) => {
  e.preventDefault();
  if (confirm('Are you sure you want to clear?')) {
    $('#customText').empty();

    referenceList = [];
    $('#referencesDiv').empty();
  }
})

// on save to collection button
$('#addToCollection').click((e) => {
  e.preventDefault();
  let logTitle = $('#logTitle').val().trim();
  var note = $("#note").html().trim();
  const passageDiv = $('#customText').html().trim();


  var myobj = { logTitle, references: referenceList, passage: passageDiv, note };
  $.ajax({
    url: '/logs/',
    type: 'POST',
    data: JSON.stringify(myobj),
    contentType: "application/json"
  })
    .done((msg) => {

      const alertMsg = '<div id="successAlert" class="alert alert-warning alert-dismissible fade show" role="alert">' +
        `<strong>Success! </strong> ${msg}` +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button></div>'
      $('#main').append(alertMsg)

      $(".alert").delay(3000).slideUp(200, function () {
        $(this).alert('close');
      });
    })
    .fail((xhr, status, error) => {
      const alertMsg = '<div id="successAlert" class="alert alert-warning alert-dismissible fade show" role="alert">' +
        `<strong>Error! </strong>${xhr.responseText}` +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button></div>'
      $('#main').append(alertMsg)

      $(".alert").delay(3000).slideUp(200, function () {
        $(this).alert('close');
      });
    });
})

// on show logs button
const displayLogs = (() => {
  $.ajax({
    url: '/logs/',
    type: 'GET',
    contentType: "application/json"
  })
    .done((logs) => {
      var logsListContent = '';
      $("#logsList").empty();
      logsListContent +=
        `<tr><th scope="col">Title</th>
         <th scope="col">References</th>
         <th scope="col">Date</th></tr>`

      for (var i = 0; i < logs.length; i++) {
        const currRef = logs[i].references.map((ref) => `${ref.bookId} ${ref.chapter}:${ref.verses}`);
        const newCurrRef = currRef.toString().replace(/\,/g, '<br/>')
        const dateTxt = moment(logs[i].date.substring(0, 10)).format('dddd MMMM D Y')
        logsListContent +=
          `<tr>
           <td><button class="removeBtn btn-sm btn text-left" id="${logs[i]._id}">${logs[i].logTitle}</Button></td>
           <td><button class="removeBtn btn-sm btn text-left" id="${logs[i]._id}">${newCurrRef}</Button></td>
           <td><button class="removeBtn btn-sm btn text-left" id="${logs[i]._id}">${dateTxt}</Button></td>
           </tr>`;
      }
      $("#logsList").append(logsListContent);
    })
    .fail((xhr, status, error) => {
    });
})

$('#highlightSelected').on('click', () => {

  try {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var newNode = document.createElement("span");
    newNode.setAttribute("style", "background-color: pink;");
    range.surroundContents(newNode);
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection) { document.selection.empty(); }
  } catch (e) {
    const msg = ' Only one section can be highlighted at a time'
    const alertMsg = '<div id="successAlert" class="alert alert-warning alert-dismissible fade show" role="alert">' +
      `<strong>Error! </strong> ${msg}` +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
      '<span aria-hidden="true">&times;</span>' +
      '</button></div>'
    $('#main').append(alertMsg)

    $(".alert").delay(3000).slideUp(200, function () {
      $(this).alert('close');
    });
  }
});



// on view entry cell click in table
$("table").on('click', 'button', function () {
  //var passage = $(this).closest("tr").find("td:eq(0)").html(); 

  currentID = this.id;
  localStorage.setItem('ID', currentID);
  loadSpecificEntry();
})

const loadSpecificEntry = (() => {
  $.ajax({
    url: '/logs/' + currentID,
    type: 'GET',
    success: (log) => {
      $('#tableDiv').hide();
      $('#logTitle').text(log.logTitle);
      const newDateTxt = moment(log.date.substring(0, 10)).format('dddd MMMM D Y')
      $('#dateLabel').text(newDateTxt);
      const currRef = log.references.map((ref) => `${ref.bookName} ${ref.chapter}:${ref.verses} | `);
      $('#referenceDiv').html(currRef);
      $('#passageText').html(log.passage);
      $('#customNote').html(log.note)
      window.scrollTo(0, 0);
      $('#specificLog').show();
    }
  });
})

// on back to entries click
$('#backToEntries').click((e) => {
  e.preventDefault();
  if (top.location.pathname === '/edit_entry.html') {
    window.location = '/entries.html';
  }
  if (top.location.pathname === '/entries.html') {
    localStorage.clear();
  }
  $('#tableDiv').show();
  displayLogs();
  $('#specificLog').hide();
  $('#passageText').empty();
})

// on go to entry edit page click
$('#goToEditEntryPage').click((e) => {
  e.preventDefault();
  window.location = '/edit_entry.html';
})

// on landing edit entry page
const onLandingEditPage = (() => {
  loadBooks();
  $.ajax({
    url: '/logs/' + currentID,
    type: 'GET',
    success: (log) => {
      $('#logTitle').val(log.logTitle);
      const currRef = log.references.map((ref) => `${ref.bookName} ${ref.chapter}:${ref.verses} | `);
      $('#referencesDiv').html(currRef);
      $('#customText').html(log.passage);
      $('#note').html(log.note)
    }
  });
})

// on apply changes entry click
$('#applyChanges').click((e) => {
  e.preventDefault();
  let updatedObj = {}
  updatedObj.logTitle = $('#logTitle').val().trim();
  updatedObj.passage = $('#customText').html().trim();
  updatedObj.note = $('#note').html().trim();
  updatedObj.references = referenceList

  $.ajax({
    url: '/logs/' + currentID,
    type: 'PATCH',
    contentType: "application/json",
    data: JSON.stringify(updatedObj),
    success: (log) => {
      const msg = 'Entry Successfully Updated'
      const alertMsg = '<div id="successAlert" class="alert alert-warning alert-dismissible fade show" role="alert">' +
          `<strong>Success! </strong> ${msg}` +
          '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
          '<span aria-hidden="true">&times;</span>' +
          '</button></div>'
        $('#main').append(alertMsg)
  
        $(".alert").delay(3000).slideUp(200, function () {
          $(this).alert('close');
        });
    }
  });
})

// on delete entry click
$('#deleteEntry').click((e) => {
  e.preventDefault();

  if (confirm('Are you sure you want to delete this entry?')) {
    $.ajax({
      url: '/logs/' + currentID,
      type: 'DELETE',
      contentType: "application/json",
      success: (msg) => {
        window.location = '/entries.html';
        localStorage.clear();
      }
    });
  }
})
