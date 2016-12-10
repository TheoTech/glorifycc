function chooseLanguage() {
    var query = '?'
    var chooseLanguageComponent = {
        view: function() {
            return m('.row', [
                m('.col-xs-6', [
                    m('select.form-control.selectpicker', {
                        title: 'Choose Language',
                        onchange: function() {
                            window.location.href
                        },
                    }, [
                        translations.map((t) => {
                            return m('option', {
                                value: t.lang._id
                            }, t.lang.label)
                        })
                    ])
                ]),
                m('.col-xs-6', [
                    m('select.form-control.selectpicker', {
                        title: 'Choose Language',
                        onchange: function() {
                            query += '&right=' + $(this).val()
                            window.location.href += query
                        }
                    }, [
                        translations.map((t) => {
                            return m('option', {
                                value: t.lang._id
                            }, t.lang.label)
                        })
                    ])
                ])
            ])
        }
    }

    return chooseLanguageComponent
}
