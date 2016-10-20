var searchBoxComponent = (function() {
    var tag = m.prop()
    var enter = function(elem, checkboxClass) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#search-button").click()
            }
        })
    }

    var searchBox = {
        view: function(ctrl, args) {
            return m('#searchInput.input-group', [
                m('input.form-control[type=text]', {
                    placeholder: 'Language, Title, or Author',
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
                            console.log(args.url)
                            window.location.replace(args.url + '/search?q=' + tag())
                        }
                    }, [
                        m('i.glyphicon.glyphicon-search')
                    ])
                ]),
                m(hasTranslationsIn, {
                    langShown: args.langShown,
                    langFilter: args.langFilter,
                    loadMoreAndApplyFilter: args.loadMoreAndApplyFilter,
                    initial: args.initial
                })
            ])
        }
    }

    return {
        searchBox: searchBox
    }
})()
