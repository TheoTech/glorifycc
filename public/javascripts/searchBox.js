var searchBoxComponent = {
    controller: function(){
      return {
        tag: m.prop(),
        enter: function(elem, checkboxClass) {
            $(elem).keyup(function(e) {
                if (e.keyCode == 13) {
                    $("#search-button").click()
                }
            })
        }
      }
    },
    view: function(vm) {
        return m('.input-group[style=width: 30em]', [
            m('input#search-input.form-control[type=text]', {
                placeholder: 'Language, Title, Author or Lyric',
                onchange: m.withAttr('value', vm.tag),
                config: function(elem, isInit, context) {
                    if (!isInit) {
                        vm.enter(elem);
                    }
                }
            }),
            m('span.input-group-btn', [
                m('button#search-button.btn.btn-success', {
                    onclick: function() {
                        window.location.href = '/songlist/search?q=' + vm.tag()
                    }
                }, [
                    m('i.glyphicon.glyphicon-search')
                ])
            ])
        ])
    }
}

m.mount(document.getElementById('searchBox'), searchBoxComponent)
