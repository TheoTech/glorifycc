
function export_1(){
  var order = m.prop([]);
  // var temp = []
  for (var i = 0; i < data.length; i++){
      order().push(i)
  }
  // console.log(length)
  // console.log(order())
  // export1.bind(export1)
  var queryString = function() {
      // console.log(order())
      var url = ''
      // var lang = this.optionChecked() ||[]
      // console.log(lang)
      var o = order() || [];
      url += '?index=' + o[0];
      for (var i = 1; i < o.length; i++) {
          url += '&index=' + o[i];
      }
      return url;
  }


  var export1 = {

      // vm: function (){
      //     url: String,
      //     order: function() {
      //         return
      //     }
      // },
      controller: function () {
        this.orders = queryString();
      },
      view: function(ctrl, args) {
          return [m('h1', 'Step 1: Put Your Songs in Order', [
                  m('a.btn.btn-primary.pull-right', {onclick: queryString, href: '/songcart/export-2' + queryString()}, 'Next')
              ]),
              m('#songsPicked', {
                config: function (elem, isInit, context) {
                  if (!isInit) {
                    sort(elem);
                  }
                }
              }, [
                  data.map((songs) => {
                      return m('div', [
                          m('.panel.panel-default', [
                              m('.panel-body', [
                                  songs.map((song) => {
                                      return m('.test', [
                                          m('h3', {
                                          }, song.title)
                                      ])
                                  })
                              ])
                          ])
                      ])
                  })
              ])
          ]
      }
  }


  // newOrder = []
  function sort(elem) {
      $(elem).sortable({
          /*stop: function(event, ui) {
              alert("New position: " + ui.item.index());
          }*/
          start: function(e, ui) {
              // creates a temporary attribute on the element with the old index
              $(this).attr('data-previndex', ui.item.index());
          },
          update: function(e, ui) {
              // gets the new and old index then removes the temporary attribute
              var newIndex = ui.item.index();
              var oldIndex = $(this).attr('data-previndex');
              var oldIndex = parseInt(oldIndex)
              var element_id = ui.item.attr('id');
              //forEach list, store the id arrangement to array, pass it to the url
              //var order = []
              if (oldIndex < newIndex) {
                  newIndex += 1
              }
              order().splice(newIndex, 0, order()[oldIndex])
              if (oldIndex > newIndex) {
                  oldIndex += 1
              }
              order().splice(oldIndex, 1);
              // console.log(order())
              // console.log(queryString())
              // console.log(order())
              // console.log(export1.order())
                  // order.splice(oldIndex, 2)
                  // var temp = order[newIndex]
                  // order[newIndex] = order[oldIndex];
                  // order[oldIndex] = temp;// oldIndex = newIndex;
                  // order[1] = 0;
                  // for(var i = 1; i < order.length; i++){
                  //     url += '&index=' + order[i]
                  // }
                  // alert('id of Item moved = ' + element_id + ' old position = ' + oldIndex + ' new position = ' + newIndex);
                  // $(this).removeAttr('data-previndex');
          }
      });
      // console.log(queryString())
  }
  // console.log(queryString())
  return export1;
}

// each songs in songss
//     //-         div
//     //-             .panel.panel-default
//     //-                 .panel-body
//     //-                     each song in songs
//     //-                         p #{song.title}
//
//
// //export1header.queryString()

m.mount(document.getElementById('step1'), export_1())
