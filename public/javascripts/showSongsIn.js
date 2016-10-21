var showSongsIn = {
    view: function(ctrl, args) {
        return m('div', [
            m('h5', 'Show songs in: ', [
                m('.btn-group', [
                    m('button.btn.btn-default.dropdown-toggle[type=button]', {
                        'data-toggle': "dropdown",
                        'aria-haspopup': "true",
                        'aria-expanded': "false"
                    }, (args.langShown() === 'all' ? 'All Languages' : args.langShown()), [
                        m('span.caret')
                    ]),
                    m('ul.dropdown-menu', [
                        m('li', [
                            m('a#all', {
                                href: '#',
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMoreAndApplyFilter(args.initial, args.langShown(), args.langFilter(), args.searchString())
                                }
                            }, 'All Languages')
                        ]),
                        args.langsExist.map((lang) => {
                            return m('li', [
                                m('a.capitalize', {
                                    href: '#',
                                    onclick: function() {
                                        args.langShown(lang)
                                        args.loadMoreAndApplyFilter(args.initial, args.langShown(), args.langFilter(), args.searchString())
                                    }
                                }, lang)
                            ])
                        })
                    ])
                ])
            ]),
            m('hr')
        ])
    }
}
