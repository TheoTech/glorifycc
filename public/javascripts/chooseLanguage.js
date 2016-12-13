function chooseLanguage() {
    function languageList(songPosition) {
        return m('.col-xs-6', [
            m('select.form-control', {
                onchange: function() {
                    if (songPosition === 'left') {
                        /*
                          replace the langcode on left query within the url
                          url example: http://localhost:8000/song/584efdd100b8484e4aa3be39?left=en&right=en
                          if the user choose chinese language on the left selectpicker then 'left=en' will change to 'left=zh'
                        */
                        window.location.href = window.location.href.replace(/left=../, 'left=' + $(this).val());
                    } else {
                        /*
                          replace the langcode on right query within the url
                          url example: http://localhost:8000/song/584efdd100b8484e4aa3be39?left=en&right=en
                          if the user choose chinese language on the right selectpicker then 'right=en' will change to 'right=zh'
                        */
                        window.location.href = window.location.href.replace(/right=.*/, 'right=' + $(this).val());
                    }
                },
                config: function(elem, isInit) {
                    if (!isInit) {
                        /*
                          getting the startIndex for langcode, +1 because of '='
                          example: if songPosition is left then search the index of string 'left' + the length of the string 'left' + 1
                          because of the '=' in the query string. adding all together will give us the index where the langcode starts,
                          because the langcode is always 2 characters then the second argument of substring can be just startIndex + 2
                        */
                        var startIndex = window.location.href.indexOf(songPosition) + songPosition.length + 1;

                        //get the langCode string, +2 because the code is only two characters
                        var langCode = window.location.href.substring(startIndex, startIndex + 2);
                        if (langCode !== '') {
                            //make selectpicker to show the language of the song
                            $(elem).prop('value', langCode)
                        }
                    }
                }
            }, [
                //this option css display will set to none so we can treat it like a placeholder on the picker
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
