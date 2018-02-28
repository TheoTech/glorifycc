import m from 'mithril';
import prop from 'mithril/stream';
import $ from 'jquery';

//Note: var uniqueLanguages, var songs, var playlistName are defined on export1.pug
let errorMsg = prop('');
let saveTranslationsChecked = function(songs) {
  let totalLyricsChecked = songs.reduce(function(a, b) {
    return a.translationsChecked.length + b.translationsChecked.length;
  });
  if (totalLyricsChecked === 0) {
    errorMsg('Please select at least one language to export a song in.');
  } else {
    errorMsg('');
    m
      .request({
        method: 'POST',
        url:
          '/user/playlist/' + encodeURIComponent(playlistName) + '/export1',
        data: songs
      })
      .then(function(res) {
        window.location.href =
          '/user/playlist/' + encodeURIComponent(playlistName) + '/export3';
      });
  }
};

let selectAll = function(elem, lang) {
  $('.' + lang).each(function(i, obj) {
    if ($(obj).prop('checked') !== $(elem).prop('checked')) {
      $(obj).trigger('click');
    }
  });
};

const alertComponent = () => {
  if (errorMsg() !== '') {
    return m('.alert.alert-danger', errorMsg());
  } else {
    return '';
  }
}

const export1Table = {
  view: vnode => {
    return [
      alertComponent(),
      m('table.table', [
        m('thead', [
          m(
            'th',
            {
              style: {
                padding: '10px'
              }
            },
            'Title'
          ),
          uniqueLanguages.map(lang => {
            return m(
              'th.text-center',
              {
                style: {
                  padding: '10px'
                }
              },
              lang.label
            );
          })
        ]),
        m('tbody', [
          m('tr', [
            m('td'),
            uniqueLanguages.map(lang => {
              return m(
                'td.text-center',
                {
                  margin: 'auto'
                },
                [
                  m('input', {
                    type: 'checkbox',
                    onclick: function() {
                      selectAll(this, lang._id);
                    }
                  })
                ]
              );
            })
          ]),
          songs.map((song, i) => {
            return m('tr', [
              m('td', song.song.title),
              uniqueLanguages.map(lang => {
                //to check if the song has the available translation as the label (th)
                var rightSong = song.availableTranslations.find(
                  availableTranslation =>
                    availableTranslation.lang._id == lang._id
                );
                var songID = rightSong ? rightSong._id : '';
                return m('td.text-center', [
                  m('input', {
                    className: lang._id,
                    id: rightSong ? songID : '',
                    type: 'checkbox',
                    disabled: rightSong ? false : true,
                    checked: _.includes(song.translationsChecked, songID)
                      ? true
                      : false,
                    onclick: function() {
                      if (this.checked) {
                        song.translationsChecked.push(songID);
                        console.log(song.translationsChecked);
                      } else {
                        _.remove(song.translationsChecked, n => n === songID);
                      }
                    }
                  })
                ]);
              })
            ]);
          })
        ])
      ]),
      m(
        'button.btn.btn-primary',
        {
          onclick: function() {
            saveTranslationsChecked(
              songs.map(song => {
                return {
                  song: song.song._id,
                  translationsChecked: song.translationsChecked
                };
              })
            );
          }
        },
        'Preview'
      )
    ];
  }
};

export function init(dom) {
  m.mount(dom, export1Table);
}
