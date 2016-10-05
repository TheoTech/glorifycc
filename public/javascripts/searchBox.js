<<<<<<< HEAD
var searchBoxComponent = (function() {
=======
var searchBoxComponent = (function(){
>>>>>>> origin/mithril
    var tag = m.prop()
    var enter = function(elem, checkboxClass) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#search-button").click()
            }
        })
    }

    var searchBox = {
        view: function() {
            return m('.input-group[style=width: 30em]', [
                m('input#search-input.form-control[type=text]', {
                    placeholder: 'Language, Title, Author or Lyric',
                    onchange: m.withAttr('value', tag),
                    config: function(elem, isInit, context) {
                        if (!isInit) {
                            enter(elem);
                        }
                    }
                }),
                m('span.input-group-btn', [
                    m('button#search-button.btn.btn-success', {
                        onclick: function() {
                            window.location.href = '/songlist/search?q=' + tag()
                        }
                    }, [
                        m('i.glyphicon.glyphicon-search')
                    ])
                ])
            ])
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, searchBox)
        }
    }
})()
