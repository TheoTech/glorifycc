var addSong = (function() {
    var addStanza = {
        view: function() {
            return m('.form-group', [
                m('label', 'Stanza'),
                m('input.form-control'),
                m('button.btn.btn-default', [
                    m('span.glyphicon.glyphicon-minus')
                ]),
                m('button.btn.btn-default', [
                    m('span.glyphicon.glyphicon-plus')
                ]),
            ])
        }
    }

    var addSongComponent = {
        view: function() {
            return m('.row', [
                m('.col-md-6', [
                    m('h1', 'Add a Song', [
                        m('.form-group', [
                            m('label', 'Title'),
                            m('input.form-control')
                        ]),
                        m('.form-group', [
                            m('label', 'Title'),
                            m('input.form-control')
                        ]),
                        m('.form-group', [
                            m('label', 'Author'),
                            m('input.form-control')
                        ]),
                        m('.form-group', [
                            m('label', 'Year Published'),
                            m('input.form-control')
                        ]),
                        m('.form-group', [
                            m('label', 'Language'),
                            m('select.form-control', [
                                m('option[value=english]', 'English'),
                                m('option[value=mandarin]', 'Mandarin'),
                                m('option[value=spanish]', 'Spanish'),
                                m('option[value=portuguese]', 'Portuguese')
                            ])
                        ]),
                        m('.form-group', [
                            m('label', 'Copyright'),
                            m('select.form-control', [
                                m('option', 'Public'),
                                m('option', 'CC0')
                            ])
                        ]),
                        m(addStanza)
                    ])
                ])
            ])
        }
    }
    return {
        addSongComponent: addSongComponent
    }
})()
