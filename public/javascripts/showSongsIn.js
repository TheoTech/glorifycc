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
                        m('li#All', {
                            onclick: function() {
                                args.langShown(this.id)
                                args.loadMore(args.initial, args.langShown(), args.langFilter())
                            }
                        }, [
                            m('a', 'All Language')
                        ]),
                        m('li#English', {
                            onclick: function() {
                                args.langShown(this.id)
                                args.loadMore(args.initial, args.langShown(), args.langFilter())
                            }
                        }, [
                            m('a', 'English')
                        ]),
                        m('li#Mandarin', {
                            onclick: function() {
                                args.langShown(this.id)
                                args.loadMore(args.initial, args.langShown(), args.langFilter())
                            },

                        }, [
                            m('a', 'Mandarin')

                        ]),
                        m('li', [
                            m('a#Spanish', {
                                onclick: function() {
                                    args.langShown(this.id)
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            }, 'Spanish')
                        ]),
                        m('li', [
                            m('a#Portuguese', {
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
