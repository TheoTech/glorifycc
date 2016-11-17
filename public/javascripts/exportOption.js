function exportOption(initialType) {
    var queryString = '';
    var type = initialType;

    function pdfOption() {
        if (type !== 0) {
            return m('div', [
                m('.radio', [
                    m('label', [
                        m('input', {
                            'type': 'radio',
                            'name': 'optradio2',
                            onclick: function() {
                                queryString = '?type=1'
                            },
                            config: function(elem, isInit) {
                                if (!isInit) {
                                    if (type === 1) {
                                        $(elem).prop('checked', 'checked')
                                        queryString = '?type=1'
                                    }
                                }
                            }
                        })
                    ], '1 language per slide')
                ]),
                m('.radio', [
                    m('label', [
                        m('input', {
                            'type': 'radio',
                            'name': 'optradio2',
                            onclick: function() {
                                queryString = '?type=2'
                            },
                            config: function(elem, isInit) {
                                if (type === 2) {
                                    if (!isInit) {
                                        $(elem).prop('checked', 'checked')
                                        queryString = '?type=2'
                                    }
                                }
                            }
                        })
                    ], '2 languages per slide')
                ]),
                m('.radio', [
                    m('label', [
                        m('input', {
                            'type': 'radio',
                            'name': 'optradio2',
                            onclick: function() {
                                queryString = '?type=3'
                            },
                            config: function(elem, isInit) {
                                if (type === 3) {
                                    if (!isInit) {
                                        $(elem).prop('checked', 'checked')
                                        queryString = '?type=3'
                                    }
                                }
                            }
                        })
                    ], '3 or more languages per slide')
                ])
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
                                    type = 0;
                                },
                                config: function(elem, isInit) {
                                    if (!isInit) {
                                        if (type === 0) {
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
                                    type = 1;
                                },
                                config: function(elem, isInit) {
                                    if (!isInit) {
                                        if (type !== 0) {
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
                }, 'Apply')
            ]
        }
    }

    return exportOptionComponent
}
