var hasTranslationsIn = {
    view: function(ctrl, args) {
        return m('span.input-group-btn', [
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
                    m('li', [
                        m('label', [
                            m('input#English[type=checkbox]', {
                                onclick: function() {
                                    if (this.checked) {
                                        args.langFilter().push(this.id)
                                    } else {
                                        _.remove(args.langFilter(), (n) => n === this.id)
                                    }
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            })
                        ])
                    ], 'English'),
                    m('li', [
                        m('label', [
                            m('input#Mandarin[type=checkbox]', {
                                onclick: function() {
                                    if (this.checked) {
                                        args.langFilter().push(this.id)
                                    } else {
                                        _.remove(args.langFilter(), (n) => n === this.id)
                                    }
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            })
                        ])
                    ], 'Mandarin'),
                    m('li', [
                        m('label', [
                            m('input#Spanish[type=checkbox]', {
                                onclick: function() {
                                    if (this.checked) {
                                        args.langFilter().push(this.id)
                                    } else {
                                        _.remove(args.langFilter(), (n) => n === this.id)
                                    }
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            })
                        ])
                    ], 'Spanish'),
                    m('li', [
                        m('label', [
                            m('input#Portuguese[type=checkbox]', {
                                onclick: function() {
                                    if (this.checked) {
                                        args.langFilter().push(this.id)
                                    } else {
                                        _.remove(args.langFilter(), (n) => n === this.id)
                                    }
                                    args.loadMore(args.initial, args.langShown(), args.langFilter())
                                }
                            })
                        ])
                    ], 'Portuguese')
                ])
            ])
        ])
    }
}
