var languageFilterComponent = (function() {
    var addFilter = function(songs) {
        m.request({
                method: 'POST',
                url: '/filter',
                data: {
                    langShown: langShown(),
                    langFilter: langFilter()
                }
            })
            .then(function(res) {
                console.log(res.songs)
                songs(res.songs)
            })
    }
    var langShown = m.prop('English')
    var langFilter = m.prop([])

    var languageFilter = {
        view: function(ctrl, args) {
            return m('div', [
                m('.btn-group', [
                    m('button.btn.btn-default.dropdown-toggle[type=button]', {
                        'data-toggle': "dropdown",
                        'aria-haspopup': "true",
                        'aria-expanded': "false"
                    }, 'Language Filter: ' + langFilter().reduce((prev, curr, i) => {
                        return (i === 0 ? prev + curr : prev + ', ' + curr)
                    }, ''), [
                        m('span.caret')
                    ]),
                    m('ul.dropdown-menu', [
                        m('li', [
                            m('label', [
                                m('input#English[type=checkbox]', {
                                    onclick: function() {
                                        if(this.checked){
                                          langFilter().push(this.id)
                                        } else {
                                          _.remove(langFilter(), (n) => n === this.id)
                                        }
                                        addFilter(args.songs)
                                    }
                                })
                            ])
                        ], 'English'),
                        m('li', [
                            m('label', [
                                m('input#Mandarin[type=checkbox]', {
                                    onclick: function() {
                                        if(this.checked){
                                          langFilter().push(this.id)
                                        } else {
                                          _.remove(langFilter(), (n) => n === this.id)
                                        }
                                        addFilter(args.songs)
                                    }
                                })
                            ])
                        ], 'Mandarin'),
                        m('li', [
                            m('label', [
                                m('input#Spanish[type=checkbox]', {
                                    onclick: function() {
                                        if(this.checked){
                                          langFilter().push(this.id)
                                        } else {
                                          _.remove(langFilter(), (n) => n === this.id)
                                        }
                                        addFilter(args.songs)
                                    }
                                })
                            ])
                        ], 'Spanish'),
                        m('li', [
                            m('label', [
                                m('input#Portuguese[type=checkbox]', {
                                    onclick: function() {
                                        if(this.checked){
                                          langFilter().push(this.id)
                                        } else {
                                          _.remove(langFilter(), (n) => n === this.id)
                                        }
                                        addFilter(args.songs)
                                    }
                                })
                            ])
                        ], 'Portuguese')
                    ])
                ]),
                m('br'),
                m('.btn-group', [
                    m('button.btn.btn-default.dropdown-toggle[type=button]', {
                        'data-toggle': "dropdown",
                        'aria-haspopup': "true",
                        'aria-expanded': "false"
                    }, 'Show Songs in: ' + langShown(), [
                        m('span.caret')
                    ]),
                    m('ul.dropdown-menu', [
                        m('li#English', {
                            onclick: function() {
                                langShown(this.id)
                                addFilter(args.songs)
                            }
                        }, [
                            m('a', 'English')
                        ]),
                        m('li#Mandarin', {
                            onclick: function() {
                                langShown(this.id)
                                addFilter(args.songs)
                            },

                        }, [
                            m('a', 'Mandarin')

                        ]),
                        m('li', [
                            m('a#Spanish', {
                                onclick: function() {
                                    langShown(this.id)
                                    addFilter(args.songs)
                                }
                            }, 'Spanish')
                        ]),
                        m('li', [
                            m('a#Portuguese', {
                                onclick: function() {
                                    langShown(this.id)
                                    addFilter(args.songs)
                                }
                            }, 'Portuguese')
                        ]),
                    ])
                ])
            ])
        }
    }
    return {
        languageFilter: languageFilter,
        langShown: langShown
    }
})()
