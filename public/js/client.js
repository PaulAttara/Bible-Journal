let referenceList = [];

// on page load
$(window).on('load', function () {
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

// on sign in click
$('#signIn').click(async (e) => {
  e.preventDefault();
  window.location = '/';
})

// on start button click
$('#startButton').click(async (e) => {
  // $('#about').hide();
  // $('#title').text('Bible Journal');
  // $('#content').show();
  e.preventDefault();
  window.location = '/new_entry.html';
})

// once book selected, display chapters
$('#bookSelect').on('change', function () {
  if (!this.value) {
    return;
  }
  $('#chapterSelect').empty()
  $('#verseSelect').empty()
  $('#verse2Select').empty()
  $('#confirmMessage').text('')

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
      // console.log(data);
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
  var currentVal = $('#customText').val();
  var book = $('#bookSelect').find(":selected").val();
  var bookTxt = $('#bookSelect').find(":selected").text();
  var chapter = $('#chapterSelect').find(":selected").text();
  var verse = $('#verseSelect').find(":selected").val();
  var verse2 = $('#verse2Select').find(":selected").val();

  if (book == null || chapter == null || verse == null || verse2 == null) {
    $('#confirmMessage').text('Please fill in all fields');
    return setTimeout(() => {
      $('#confirmMessage').text('')
    }, 3000);

  }
  $.ajax({
    url: '/web/passage/' + book + '/' + chapter + '/' + verse + '/' + verse2,
    type: 'GET',
    // 'Cache-Control': 'max-age=1000',
    // contentType: "text",
    // dataType: 'application/json' 
  })
    .done((data) => {
      console.log(data)
      // let verseTxt = data.content.replace(/^\s+/g, '').replace(/\s+/g, ' '); // remove only leading whitespace AND consecutive whitespaces
      // $('#customText').val(currentVal + verseTxt + ' (' + data.reference  + ')' + '\n\n');
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
    // $('#customText').val('');
    $('#customText').empty();

    referenceList = [];
    $('#referencesDiv').empty();
    $('#referencesDiv').append('<label><b>References: </b></label>');
  }
})

// on save to collection button
$('#addToCollection').click((e) => {
  e.preventDefault();
  let logTitle = $('#logTitle').val();
  var note = $("#note").val();

  var myobj = { logTitle, references: referenceList, note };
  $.ajax({
    url: '/logs/',
    type: 'POST',
    data: JSON.stringify(myobj),
    contentType: "application/json"
  })
    .done((msg) => {
      $('#confirmMessage').text(msg)
      setTimeout(() => {
        $('#confirmMessage').text('')
      }, 3000);
    })
    .fail((xhr, status, error) => {
      $('#confirmMessage').text(xhr.responseText)
      setTimeout(() => {
        $('#confirmMessage').text('')
      }, 3000);
    });
  if ($('#displayLogs').text() == 'Hide Logs') {
    $("#displayLogs").click()
  }
})

// on show logs button
$('#displayLogs').click((e) => {
  e.preventDefault();
  if ($('#displayLogs').text() == 'Show Logs') {
    $("#displayLogs").html('Hide Logs');
    $('#logsList').show();
  }
  else {
    $("#displayLogs").html('Show Logs');
    $('#logsList').hide();
  }

  $.ajax({
    url: '/logs/',
    type: 'GET',
    contentType: "application/json"
  })
    .done((logs) => {
      var logsListContent = ''
      $("#logsList").empty();
      logsListContent +=
        '<tr><th scope="col">Title</th><th style width="50%"scope="col">Note</th><th scope="col">Options</th></tr>'
      for (var i = 0; i < logs.length; i++) {
        logsListContent +=
          `<tr>
       <td>${logs[i].logTitle}</td>
       <td>${logs[i].note}</td>
       <td><button class="removeBtn" id="${logs[i]._id}">Remove</Button></td>
       </tr>`;
      }
      $("#logsList").append(logsListContent);
    })
    .fail((xhr, status, error) => {
      $('#confirmMessage').text(xhr.responseText)
    });
})

// to delete an entry in table
$("table").on('click', 'button', function () {
  //var passage = $(this).closest("tr").find("td:eq(0)").html(); 

  const id = this.id;
  $.ajax({
    url: 'logs/' + id,
    type: 'DELETE',
    data: id,
    success: (msg) => {
      // console.log(msg);
    }
  });
  $("#displayLogs").click();
})

/*

// display all api supported Bible versions
$.ajax({
  url: 'web/books/',
  type: 'GET',
  dataType: 'json',
  success: (data) => {
    // $('#books-list').html('All bookss: ' + data.message)
    $("#booksList").html('');
    var booksListContent = '';
    for(var i = 0; i < data.length; i++)
    {
       booksListContent += `<a href="web/${data[i].id}" id="web/${data[i].id}">${data[i].name}</a><br/>`;
    }
    $("#booksList").append(booksListContent);
  },
});
*/
