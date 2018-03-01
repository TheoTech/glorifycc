import m from 'mithril';

export default function exportOption(
  defaultLanguagePerSlide,
  maxNumberOfSongs
) {
  let queryString = '';
  let languagePerSlide = defaultLanguagePerSlide;

  function radio(queryStr, numberOfLanguage, label, name) {
    return m('.radio', [
      m(
        'label',
        [
          m('input', {
            type: 'radio',
            //disable the radio button if the max number of songs is less than the option
            disabled: maxNumberOfSongs < numberOfLanguage ? true : false,
            name: name,
            onclick: function() {
              queryString = queryStr;
              window.location.href = 'export3' + queryString;
            },
            oncreate: vnode => {
              if (languagePerSlide === numberOfLanguage) {
                $(vnode.dom).prop('checked', 'checked');
                queryString = queryStr;
              }
            }
          })
        ],
        label
      )
    ]);
  }

  function numberOfLanguageOptions() {
    if (languagePerSlide !== 0) {
      return m('div', [
        m('hr'),
        radio('?language=1', 1, '1 language per slide', 'optradio2'),
        radio('?language=2', 2, '2 languages per slide', 'optradio2'),
        radio('?language=3', 3, '3 or more languages per slide', 'optradio2')
      ]);
    }
  }

  const exportOptionComponent = {
    view: function() {
      return [
        m('div', [
          m('.radio', [
            m(
              'label',
              [
                m('input', {
                  type: 'radio',
                  name: 'optradio',
                  onclick: function() {
                    queryString = '';
                    languagePerSlide = 0;
                    window.location.href = 'export3' + queryString;
                  },
                  oncreate: vnode => {
                    if (languagePerSlide === 0) {
                      $(vnode.dom).prop('checked', 'checked');
                    }
                  }
                })
              ],
              'PDF (handouts)'
            )
          ]),
          m('.radio', [
            m(
              'label',
              [
                m('input', {
                  type: 'radio',
                  name: 'optradio',
                  onclick: function() {
                    languagePerSlide = 1;
                    window.location.href = 'export3?language=1';
                  },
                  oncreate: vnode => {
                    if (languagePerSlide !== 0) {
                      $(vnode.dom).prop('checked', 'checked');
                    }
                  }
                })
              ],
              'PPT (slides)'
            )
          ])
        ]),
        numberOfLanguageOptions()
      ];
    }
  };

  return exportOptionComponent;
}
