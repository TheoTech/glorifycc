var showSongsIn = {
    view: function(ctrl, args) {
        return m('div', [
            m('h5', 'Show songs in: ', [
                m('.btn-group', [
                    m('button.btn.btn-default.dropdown-toggle[type=button]', {
                        'data-toggle': "dropdown",
                        'aria-haspopup': "true",
                        'aria-expanded': "false"
                    }, (args.langShown() === 'All' ? 'All Languages' : args.langShown()), [
                        m('span.caret')
                    ]),
                    m('ul.dropdown-menu', [
                        m('li#All', [
                            m('a', {
                                href: '',
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            }, 'All Language')
                        ]),
                        m('li', [
                            m('a#English', {
                                href: '',
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            }, 'English')
                        ]),
                        m('li', [
                            m('a#Mandarin', {
                                href: '',
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            }, 'Mandarin')

                        ]),
                        m('li', [
                            m('a#Spanish', {
                                href: '',
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            }, 'Spanish')
                        ]),
                        m('li', [
                            m('a#Portuguese', {
                                href: '',
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            }, 'Portuguese')
                        ]),
                    ])
                ])
            ]),
            m('hr')
        ])
    }
}
