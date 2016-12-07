var searchBoxComponent = (function() {
    var enter = function(elem, checkboxClass) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#search-button").click()
            }
        })
    }

    var searchBox = {
        view: function(ctrl, args) {
            return m('#searchInput.input-group', {
                style: {
                    width: '100%'
                }
            }, [
                m('input.form-control[type=text]', {
                    placeholder: 'Search by title, lyrics or author',
                    onchange: m.withAttr('value', args.searchString),
                    config: function(elem, isInit, context) {
                        if (!isInit) {
                            enter(elem);
                        }
                    }
                }),
                m('span.input-group-btn', [
                    m('button#search-button.btn.btn-success', {
                        onclick: function() {
                            args.loadMoreAndApplyFilter(args.initial, args.langShown(), args.langFilter(), args.searchString())
                        }
                    }, [
                        m('i.glyphicon.glyphicon-search')
                    ])
                ]),
                m('span.input-group-btn', [
                    m('.btn-group', [
                        m('button.btn.btn-default.dropdown-toggle[type=button]', {
                            'data-toggle': "dropdown",
                            'aria-haspopup': "true",
                            'aria-expanded': "false"
                        }, [
                            m('i.glyphicon.glyphicon-cog')
                        ]),
                        m('ul.dropdown-menu', [
                            m('li', [
                                m('h5', 'Show songs that have translations in: ')
                            ]),
                            args.langsExist.map((lang) => {
                                return m('li.capitalize', [
                                    m('input[type=checkbox]', {
                                        onclick: function() {
                                            if (this.checked) {
                                                args.langFilter().push(lang._id)
                                            } else {
                                                _.remove(args.langFilter(), (n) => n === lang._id)
                                            }
                                            args.loadMoreAndApplyFilter(args.initial, args.langShown(), args.langFilter(), args.searchString())
                                        }
                                    })
                                ], lang.label)
                            })
                        ])
                    ])
                ])
            ])
        }
    }

    return {
        searchBox: searchBox
    }
})()
