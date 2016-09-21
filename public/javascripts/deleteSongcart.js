$('#delete').on('click', function(e) {
      e.preventDefault();

      $('input:checked').each(function(index, value) {
          var val = $(this).attr('id');
          // console.log(JSON.stringify(val));
          // console.log($(this));
          var $thisInput = $(this);

          $.ajax({
              url: '/songcart/' + val,
              type: 'DELETE'
          }).done(function() {
              $thisInput.parents('tr').remove();
          });
      });
})


// function delete(elem){
//   $(elem).on('click', function(e) {
//       e.preventDefault();
//
//       $('input:checked').each(function(index, value) {
//           var val = $(this).attr('id');
//           // console.log(JSON.stringify(val));
//           // console.log($(this));
//           var $thisInput = $(this);
//
//           $.ajax({
//               url: '/songcart/' + val,
//               type: 'DELETE'
//           }).done(function() {
//               $thisInput.parents('tr').remove();
//           });
//       });
//   });
// }
//
// var edit = {
//     view: function() {
//         console.log(songs)
//         return m('.panel.panel-default', [
//             m('.panel-body', [
//                 m('table.table', [
//                     m('thead', [
//                         m('thead', [
//                             m('th', [
//                                 m('.deleteCheckbox.collapse')
//                             ]),
//                             m('th', 'Title'),
//                             m('th', 'Language')
//                         ]),
//                         m('tbody', [
//                             songs.forEach((song) => {
//                                 return m('tr', [
//                                     m('td', [
//                                         m('.deleteCheckbox.collapse', [
//                                             m('input[type=checkbox]', {
//                                                 id: song._id
//                                             })
//                                         ])
//                                     ]),
//                                     m('td', song.title),
//                                     m('td.capitalize', song.lang)
//                                 ])
//                             })
//                         ])
//                     ])
//                 ])
//             ])
//         ])
//     }
// }
//
// var deleteButton = {
//   view: function(){
//     return [m('button.deleteCheckbox.collapse.btn.btn-success.pull-right[data-toggle=collapse data-target=.deleteCheckbox]', 'Done'),
//   m('a#delete.deleteCheckbox.collapse.btn.btn-default.pull-right', {config: function (elem, isInit, context) {
//     if (!isInit) {
//       delete(elem);
//     }
//   }}, 'Delete')]
//   }
// }
//
// m.mount(document.getElementById('songcartPanel'), edit)
// m.mount(document.getElementById('deletebutton'), edit)
// // $("#edit").on(click(function() {
// //     $('.checkbox').toggle();
// //
// // });
//
// // var demo = {};
// // demo.controller = function() {
// //   var ctrl = this;
// //   ctrl.single = m.prop(0);
// //   ctrl.checks = {
// //     left: m.prop(false),
// //     middle: m.prop(false),
// //     right: m.prop(false)
// //   };
// //   ctrl.radio = m.prop('left');
// // };
// //
// // demo.view = function(ctrl) {
// //   return m("div", [
// //     m("div", [
// //       m("h4", ["Single toggle"]),
// //       m("pre", [ctrl.single()]),
// //       m("button", {
// //         class: "btn btn-primary",
// //         config: m.ui.configCheckbox(ctrl.single, {
// //           true: 1,
// //           false: 0
// //         })
// //       }, [
// //         "Single Toggle"
// //       ])
// //     ]),
// //     m("br"),
// //     m("div", [
// //       m("h4", ["Checkbox"]),
// //       m("pre", [JSON.stringify(ctrl.checks)]),
// //       m("div", {
// //         class: "btn-group"
// //       }, [
// //         m("button", {
// //           class: "btn btn-success",
// //           config: m.ui.configCheckbox(ctrl.checks.left)
// //         }, [
// //           "Left"
// //         ]),
// //         m("button", {
// //           class: "btn btn-success",
// //           config: m.ui.configCheckbox(ctrl.checks.middle)
// //         }, [
// //           "Middle"
// //         ]),
// //         m("button", {
// //           class: "btn btn-success",
// //           config: m.ui.configCheckbox(ctrl.checks.right)
// //         }, [
// //           "Right"
// //         ])
// //       ])
// //     ]),
// //     m("br"),
// //     m("div", [
// //       m("h4", ["Radio"]),
// //       m("pre", [ctrl.radio()]),
// //       m("div", {
// //         class: "btn-group"
// //       }, [
// //         m("button", {
// //           class: "btn btn-danger",
// //           config: m.ui.configRadio(ctrl.radio, 'left')
// //         }, [
// //           "Left"
// //         ]),
// //         m("button", {
// //           class: "btn btn-danger",
// //           config: m.ui.configRadio(ctrl.radio, 'middle')
// //         }, [
// //           "Middle"
// //         ]),
// //         m("button", {
// //           class: "btn btn-danger",
// //           config: m.ui.configRadio(ctrl.radio, 'right')
// //         }, [
// //           "Right"
// //         ])
// //       ])
// //     ])
// //   ]);
// // };
// //
// // m.mount(document.getElementById('demo'), demo)
