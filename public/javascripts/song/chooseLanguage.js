'use strict';

import m from 'mithril';
import $ from 'jquery';

function languageList(songPosition, rightSongExists) {
  return m('.col-xs-6', [
    m(
      'select.form-control',
      {
        onchange: function() {
          if (songPosition === 'left') {
            /*
                      replace the langcode on left query within the url
                      url example: http://localhost:8000/song/584efdd100b8484e4aa3be39?left=en&right=en
                      if the user choose chinese language on the left selectpicker then 'left=en' will change to 'left=zh'
                    */
            window.location.href = window.location.href.replace(
              /left=../,
              'left=' + $(this).val()
            );
          } else {
            /*
                      replace the langcode on right query within the url
                      url example: http://localhost:8000/song/584efdd100b8484e4aa3be39?left=en&right=en
                      if the user choose chinese language on the right selectpicker then 'right=en' will change to 'right=zh'
                    */
            window.location.href = window.location.href.replace(
              /right=.*/,
              'right=' + $(this).val()
            );
          }
        },
        oninit: vnode => {
          /*
                      getting the startIndex for langcode, +1 because of '='
                      example: if songPosition is left then search the index of string 'left' + the length of the string 'left' + 1
                      because of the '=' in the query string. adding all together will give us the index where the langcode starts,
                      because the langcode is always 2 characters then the second argument of substring can be just startIndex + 2
                    */
          let startIndex =
            window.location.href.indexOf(songPosition) +
            songPosition.length +
            1;

          //get the langCode string, +2 because the code is only two characters
          let langCode = window.location.href.substring(
            startIndex,
            startIndex + 2
          );
          if (songPosition === 'right' && rightSongExists) {
            //make selectpicker to show the language of the song
            $(vnode.dom).prop('value', langCode);
          } else if (songPosition === 'left') {
            //left will always exists because handle this case already in the server side so we only need to check
            //whether it is the left picker or not
            //make selectpicker to show the language of the song
            $(vnode.dom).prop('value', langCode);
          }
        }
      },
      [
        //this option css display will set to none so we can treat it like a placeholder on the picker
        m(
          'option',
          {
            disabled: 'disabled',
            selected: 'selected'
          },
          'Choose Language'
        ),
        translations.map(t => {
          return m(
            'option',
            {
              id: t.lang.code + songPosition,
              value: t.lang.code
            },
            t.lang.label
          );
        })
      ]
    )
  ]);
}

const chooseLanguageComponent = {
  view: vnode => {
    return m('.row', [
      languageList('left'),
      languageList('right', { rightSongExists: vnode.attrs.rightSongExists })
    ]);
  }
};

export default chooseLanguageComponent;
