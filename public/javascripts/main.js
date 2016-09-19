$('#delete').on('click', function(e) {
    e.preventDefault();

    $('input:checked').each(function(index, value) {
        var val = $(this).attr('id');
        console.log(val)
        console.log($(this));
        var $thisInput = $(this);

        $.ajax({
            url: '/songlist-db/' + val,
            type: 'DELETE'
        }).done(function() {
            $thisInput.parents('tr').remove();
        });
    });
});


// var str = 'ahahahhaha/r/n/r/n/r/n/r/nhahahahahaha/r/n/r/nhehehehe'
// var res = str.split('/r/n')
// console.log(res)


// var index = $("#second").index;
// console.log(index)
// $("#demo").on("click", "div", function() {
//     var index = $(this).index()
//     console.log($('.option').eq(index))
// });

// var list = document.getElementById('first')
// console.log(list[1].index)


// $('#export-1').sortable({
//     start: function(e, ui) {
//         // creates a temporary attribute on the element with the old index
//         $(this).attr('data-previndex', ui.item.index());
//     },
//     update: function(e, ui) {
//         // gets the new and old index then removes the temporary attribute
//         var newIndex = ui.item.index();
//         console.log(ui.item.index())
//         var oldIndex = $(this).attr('data-previndex');
//         $(this).removeAttr('data-previndex');
//     }
// });
// var jade = require('jade'),
//     fs = require('fs');
//
// fs.readFile('index.jade', 'utf8', function (err, data) {
//     if (err) throw err;
//     console.log(data);
//     var fn = jade.compile(data);
//     var html = fn();
//     console.log(html);
// });





// var langCapitalized = song.lang.charAt(0).toUpperCase() + song.lang.slice(1)
//
//
// var song_id = $('#orisong').attr('id')
//
// var data = m.request({method: 'PUT', url: '/songlist/'+ song_id}).then(function(response){
//   console.log(response)
//   var vm = {
//       translations: function(){
//         if (!response){
//           return [{}]
//         }
//         return response
//       },
//       lang: m.prop(),
//       rightTranslation: function(){
//         if (translations){
//           this.translations.filter((t) => t.lang() === this.lang)
//         } else {
//           return {}
//         }
//       }
//
//     }
//   // console.log(vm().translations
//   var dropdownOption = {
//     controller: function(){
//       this.data = vm
//     },
//     view: function(ctrl){
//       return [
//         m('label', 'Language'),
//         m('select', {onChange: m.withAttr('value', ctrl.data.lang)}), [
//           ctrl.data.translations.forEach(function(translation){
//             m('option', translation.lang)
//           })
//         ]
//       ]
//     }
//   }
//
//   var translation = {
//     controller: function(){
//       this.data = vm
//     },
//     view: function(ctrl){
//       return [
//         m('h4', ctrl.data.lang()),
//         m('p', ctrl.data.rightTranslation().lyric)
//       ]
//     }
//   }
//
//   // console.log(JSON.stringify(vm()))
//   m.mount(document.getElementById('dropdownOption'), dropdownOption)
//   m.mount(document.getElementById('translation'), translation)
// })
