function chooseLanguage() {
    function languageList(songPosition) {
        return m('.col-xs-6', [
            m('select.form-control', {
                onchange: function() {
                    if (songPosition === 'left') {
                        window.location.href = window.location.href.replace(/left=../, 'left=' + $(this).val());
                    } else {
                        window.location.href = window.location.href.replace(/right=.*/, 'right=' + $(this).val());
                    }
                },
                config: function(elem, isInit) {
                    if (!isInit) {
                        //getting the startIndex for langcode, +1 because of '='
                        var startIndex = window.location.href.indexOf(songPosition) + songPosition.length + 1;

                        //get the langCode string, +2 because the code is only two characters
                        var langCode = window.location.href.substring(startIndex, startIndex + 2);
                        if (langCode !== '') {
                            $(elem).prop('value', langCode)
                        }
                    }
                }
            }, [
                m('option', {
                    'disabled': 'disabled',
                    'selected': 'selected'
                }, 'Choose Language'),
                translations.map((t) => {
                    return m('option', {
                        id: t.lang.code + songPosition,
                        value: t.lang.code
                    }, t.lang.label)
                })
            ])
        ])
    }

    var chooseLanguageComponent = {
        view: function() {
            return m('.row', [
                languageList('left'),
                languageList('right')
            ])
        }
    }

    return chooseLanguageComponent
}
