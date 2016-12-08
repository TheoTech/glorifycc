function chooseLanguage() {
    var query = '?'
    var chooseLanguageComponent = {
        view: function() {
            return m('.row', [
                m('.col-xs-offset-6.col-xs-6', [
                    m('select.form-control.selectpicker', {
                        title: 'Choose Language',
                        onchange: function() {
                            query += 'left' + $(this).val()
                        }
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
                            query += 'right' + $(this).val()
                        }
                    }, [
                        translations.map((t) => {
                            return m('option', {
                                value: t.lang._id
                            }, t.lang)
                        })
                    ])
                ])
            ])
        }
    }

    return chooseLanguageComponent
}
