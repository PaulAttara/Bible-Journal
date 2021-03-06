let referenceList = [];
let currentID = '';
let oldTextBeforeHighlight = ''
var nameUser = ''

// on any page load
$(window).on('load', function () {

  // on home page load
  if (top.location.pathname === '/home') {
    storeName()
    getVerseOfDay();
  }

  // on new entries page load
  if (top.location.pathname === '/new_entry') {
    loadBooks();
    // force page to scroll to cursor when type in note
    document.getElementById("note").addEventListener("input", function () {
      $('#note').focus();
      $.event.trigger({ type: 'keypress' }); // works cross-browser
    }, false);
    document.getElementById("prayer").addEventListener("input", function () {
      $('#prayer').focus();
      $.event.trigger({ type: 'keypress' }); // works cross-browser
    }, false);
  }

  // on entries page load
  if (top.location.pathname === '/entries') {
    displayLogs();
  }

  // on edit entries page load
  if (top.location.pathname === '/edit_entry') {
    currentID = localStorage.getItem('ID')
    onLandingEditPage();
  }

  // on view entry entries page load
  if (top.location.pathname === '/view_entry') {
    currentID = localStorage.getItem('ID')
    loadSpecificEntry();
  }
})


// on testing sign in click
$('#signIn').click(async (e) => {
  e.preventDefault();

  window.location = '/home';
})

function onSignIn(googleUser) {
  console.log('entered client sign in function')
  // console.log('Image URL: ' + profile.getImageUrl());
  auth2 = gapi.auth2.init();

  var id_token = googleUser.getAuthResponse().id_token;
  localStorage.setItem('token', id_token);
  nameUser = googleUser.getBasicProfile().getGivenName()
  console.log(nameUser)

  const tokenObj = {
    TOKEN_ID: id_token
  }

  $.ajax({
    url: '/signin/',
    type: 'POST',
    data: JSON.stringify(tokenObj),
    contentType: "application/json",
    success: (data) => {
      localStorage.setItem('token', data.token);
      window.location = '/home'
    },
  });
}

function storeName() {
  setTimeout(
    function () {
      nameUser = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
      console.log(nameUser.Ad)
      $('#title').html('<h2>Welcome ' + nameUser.Ad + '!</h2>')
    }, 1000);
}

function onLoad() {
  gapi.load('auth2', function () {
    gapi.auth2.init();
  });
}

function signOut() {
  try {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }
  catch (e) {
    // onLoad()
  }
  $.ajax({
    url: '/signout/',
    type: 'POST',
    contentType: "application/json",
    success: (data) => {
      console.log(data)
      localStorage.clear()
      console.log('User signed out.');
      window.location = '/'
    },
  });

}

// on start button click
$('#startButton').click(async (e) => {
  e.preventDefault();
  window.location = '/new_entry';
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
      $('#verseOfDay').html(data.passages[0].content + ` ${data.passages[0].reference}`);
    },
  });
})

const loadBooks = (() => {
  $('#bookSelect').empty()
  $('#chapterSelect').empty()
  $('#verseSelect').empty()
  $('#verse2Select').empty()
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

// $('input[name=bookName]').focusin(function() { // ATTEMPT
//   $('input[name=bookName]').val('');
//   $('#chapterSelect').empty()
//   $('#verseSelect').empty()
//   $('#verse2Select').empty()
//   const test = $('#bookSelects').text()
//   console.log(test)

//   $('#chapterSelect').append($(
//     '<option>',
//     {
//       value: 'Chapter',
//       text: 'Chapter'
//     }));
//   $.ajax({
//     url: '/web/' +  $('input[name=bookName]').val(),
//     type: 'GET',
//     dataType: 'json',
//     success: (data) => {
//       // remove intro chapter
//       $.each(data, function (i, item) {
//         if (item.number !== 'intro') {
//           $('#chapterSelect').append($('<option>', {
//             value: item.number,
//             text: item.number
//           }));
//         }
//       });
//     },
//   });
// });



// once book selected, display chapters // ATTEMPT
// $("#bookSelect").on('input', function () {
//   var val = this.value;
//   if($('#allNames option').filter(function(){
//       return this.value.toUpperCase() === val.toUpperCase();        
//   }).length) {
//       //send ajax request
//       alert(this.value);
//   }
// });

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

  if (book == null || chapter == null || verse == null || verse2 === 'Verse' || verse === 'Verse') {
    const msg = 'Please select book, chapter and verses'
    return showAlertMsg(msg, 'Error')
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
      loadBooks()
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
  const passageDiv = $('#customText').html().trim();
  var note = $("#note").html().trim();
  var prayer = $("#prayer").html().trim();

  var myobj = { logTitle, references: referenceList, passage: passageDiv, note, prayer };
  myobj.token = localStorage.getItem('token')

  $.ajax({
    url: '/logs/',
    type: 'POST',
    data: JSON.stringify(myobj),
    contentType: "application/json"
  })
    .done((msg) => {
      showAlertMsg(msg, 'Success')
      window.location = '/entries'
    })
    .fail((xhr, status, error) => {
      // showAlertMsg(xhr.responseText, 'Error')
      return showAlertMsg('Please enter a title, a passage, and a note', 'Error')
    });
})

// on show logs button
const displayLogs = (() => {
  const token = localStorage.getItem('token')

  $.ajax({
    url: '/logs/',
    type: 'GET',
    // data: ataObj,
    beforeSend: function (xhr) { xhr.setRequestHeader('token', token); },
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
        const currRef = logs[i].references.map((ref) => {
          if (ref.verses) {
            let verseArr = ref.verses.split('-');
            if (verseArr[0] === verseArr[1]) {
              let verseArr2 = `${ref.bookId} ${ref.chapter}:${ref.verses}`.split('-')
              return verseArr2[0]
            }
            else {
              return `${ref.bookId} ${ref.chapter}:${ref.verses}`
            }
          }
        });

        console.log(logs[i].references)
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

// on view entry cell click in table
$("table").on('click', 'button', function () {
  currentID = this.id;
  localStorage.setItem('ID', currentID);
  window.location = '/view_entry';
})

const loadSpecificEntry = (() => {
  const token = localStorage.getItem('token')
  $.ajax({
    url: '/logs/' + currentID,
    type: 'GET',
    beforeSend: function (xhr) { xhr.setRequestHeader('token', token); },

    success: (log) => {
      $('#logTitle').text(log.logTitle);
      const newDateTxt = moment(log.date.substring(0, 10)).format('dddd MMMM D Y')
      $('#dateLabel').text(newDateTxt);
      const currRef = log.references.map((ref) => `${ref.bookName} ${ref.chapter}:${ref.verses} | `);
      $('#referenceDiv').html(currRef);
      $('#passageText').html(log.passage);
      $('#customNote').html(log.note)
      $('#customPrayer').html(log.prayer)
    }
  });
})

// on landing edit entry page
const onLandingEditPage = (() => {
  loadBooks();
  const token = localStorage.getItem('token')
  $.ajax({
    url: '/logs/' + currentID,
    type: 'GET',
    beforeSend: function (xhr) { xhr.setRequestHeader('token', token); },
    success: (log) => {
      $('#logTitle').val(log.logTitle);
      referenceList = log.references
      const currRef = log.references.map((ref) => `${ref.bookName} ${ref.chapter}:${ref.verses} | `);
      $('#referencesDiv').html(currRef);
      $('#customText').html(log.passage);
      $('#note').html(log.note)
      $('#prayer').html(log.prayer)
    }
  });
})

// on apply changes entry click
$('#applyChanges').click((e) => {
  e.preventDefault();
  let updatedObj = {}
  const token = localStorage.getItem('token');

  updatedObj.logTitle = $('#logTitle').val().trim();
  updatedObj.passage = $('#customText').html().trim();
  updatedObj.note = $('#note').html().trim();
  updatedObj.prayer = $('#prayer').html().trim();
  updatedObj.references = referenceList
  updatedObj.token = token

  console.log(referenceList)

  $.ajax({
    url: '/logs/' + currentID,
    type: 'PATCH',
    contentType: "application/json",
    data: JSON.stringify(updatedObj),
    success: (log) => {
      const msg = 'Entry Successfully Updated'
      showAlertMsg(msg, 'Success')
      window.location = '/entries';
    }
  });
})

// on delete entry click
$('#deleteEntry').click((e) => {
  e.preventDefault();
  const token = localStorage.getItem('token')

  if (confirm('Are you sure you want to delete this entry?')) {
    $.ajax({
      url: '/logs/' + currentID,
      type: 'DELETE',
      beforeSend: function (xhr) { xhr.setRequestHeader('token', token); },
      contentType: "application/json",
      success: (msg) => {
        window.location = '/entries';
        localStorage.removeItem('ID');
      }
    });
  }
})

// on back to entries click
$('#backToEntries').click((e) => {
  e.preventDefault();
  window.location = '/entries';
})

// on back to specific entry click
$('#backToEntry').click((e) => {
  e.preventDefault();
  window.location = '/view_entry';
})

// on go to entry edit page click
$('#goToEditEntryPage').click((e) => {
  e.preventDefault();
  window.location = '/edit_entry';
})

// redirect to home
$('#goHome').click((e) => {
  e.preventDefault();
  window.location = '/home'
})

// change content of button when add prayer clicked
$('#prayerCollapse').on('show.bs.collapse', function () {
  $('#addPrayerBox').html('Hide Prayer Box')
})
$('#prayerCollapse').on('hide.bs.collapse', function () {
  $('#addPrayerBox').html('Add Prayer')
})

$('#searchBox').keypress(function () {
  console.log($('#searchBox').val());
  const filter = $('#searchSelect').find(":selected").val();

});

// method to show alert box
const showAlertMsg = ((msg, type) => {
  const alertMsg = '<div id="successAlert" class="alert alert-warning alert-dismissible fade show" role="alert">' +
    `<strong>${type}! </strong> ${msg}` +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
    '<span aria-hidden="true">&times;</span>' +
    '</button></div>'
  $('#main').append(alertMsg)

  $(".alert").delay(3000).slideUp(200, function () {
    $(this).alert('close');
  });

})

$('#highlightSelected').on('click', () => {

  try {
    // console.log(window.getSelection().anchorNode)
    // if ($(window.getSelection().anchorNode).attr('id') === '') { console.log('NOTHING SELECTED') }


    const colorHexCode = $('#colorSelect').find('option:selected').attr('id');
    // console.log('before:', $('#note').html());

    oldTextBeforeHighlight = $('#customText').html();
    var selection = window.getSelection();
    // console.log(selection)
    var range = selection.getRangeAt(0);
    // console.log(range)
    // const div = document.createElement("div")
    // range.insertNode(div);
    var newNode = document.createElement("span");
    newNode.setAttribute("style", "background-color: " + colorHexCode + ';');
    range.surroundContents(newNode);


    // $('#note').append('<')
    // console.log('after:', $('#note').html());

    // clear cursor selection once text successfully highlighted
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection) { document.selection.empty(); }
  } catch (e) {
    const msg = ' Only one verse can be highlighted at a time'
    return (msg, 'Error')
  }
});
