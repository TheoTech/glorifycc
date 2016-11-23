function exportOption(defaultLanguagePerSlide, maxNumberOfSongs) {
    var queryString = '';
    var languagePerSlide = defaultLanguagePerSlide;

    function radio(queryStr, numberOfLanguage, label, name) {
        return m('.radio', [
            m('label', [
                m('input', {
                    'type': 'radio',
                    //disable the radio button if the max number of songs is less than the option
                    'disabled': maxNumberOfSongs < numberOfLanguage ? true : false,
                    'name': name,
                    onclick: function() {
                        queryString = queryStr
                    },
                    config: function(elem, isInit) {
                        if (!isInit) {
                            if (languagePerSlide === numberOfLanguage) {
                                $(elem).prop('checked', 'checked')
                                queryString = queryStr
                            }
                        }
                    }
                })
            ], label)
        ])
    }

    function pdfOption() {
        if (languagePerSlide !== 0) {
            return m('div', [
                radio('?language=1', 1, '1 language per slide', 'optradio2'),
                radio('?language=2', 2, '2 languages per slide', 'optradio2'),
                radio('?language=3', 3, '3 or more languages per slide', 'optradio2')
            ])
        }
    }

    var exportOptionComponent = {
        view: function() {
            return [
                m('div', [
                    m('.radio', [
                        m('label', [
                            m('input', {
                                'type': 'radio',
                                'name': 'optradio',
                                onclick: function() {
                                    queryString = '';
                                    languagePerSlide = 0;
                                },
                                config: function(elem, isInit) {
                                    if (!isInit) {
                                        if (languagePerSlide === 0) {
                                            $(elem).prop('checked', 'checked')
                                        }
                                    }
                                }
                            })
                        ], 'PDF')
                    ]),
                    m('.radio', [
                        m('label', [
                            m('input', {
                                'type': 'radio',
                                'name': 'optradio',
                                onclick: function() {
                                    languagePerSlide = 1;
                                },
                                config: function(elem, isInit) {
                                    if (!isInit) {
                                        if (languagePerSlide !== 0) {
                                            $(elem).prop('checked', 'checked')
                                        }
                                    }
                                }
                            })
                        ], 'PPT')
                    ])
                ]),
                pdfOption(),
                m('button.btn.btn-default', {
                    onclick: function() {
                        window.location.href = 'export3' + queryString
                    }
                }, 'See Preview')
            ]
        }
    }

    return exportOptionComponent
}
