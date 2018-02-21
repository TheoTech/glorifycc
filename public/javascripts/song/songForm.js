'use strict';

import m from 'mithril';
import prop from 'mithril/stream';
import { isEmpty } from 'lodash';
import $ from 'jquery';

/**
 * obj = {
    song: ,
    url: ,
    readonly: ,
    submitButton: ,
    formID:
  }
  song is object
  url is the url for post method
  readonly is a flag to set whether the input readonly or not
  submitButton is a flag to determine whether to show submit button at the bottom of the form or not
  formID is the id for differentiation all element in orisong form and translation form
 */

function songForm(obj) {
  let title = prop(obj.song.title);
  let author = prop(obj.song.author);
  let translator = prop(obj.song.translator);
  let year = prop(obj.song.year);
  let lang = prop(obj.song.lang._id);
  let copyright = prop(obj.song.copyright);
  let lyrics = obj.song.lyrics;
  let youtubeLink = prop(obj.song.youtubeLink);
  let copyrightTypes = obj.copyrightTypes;
  let availableLanguages = obj.availableLanguages;

  //copypaste stores the current data for copy and paste box
  let copypaste = [];
  let errors = [];

  function addSong() {
    m
      .request({
        method: 'post',
        url: obj.url,
        data: {
          title: title(),
          author: author(),
          translator: translator(),
          year: year(),
          lang: lang(),
          copyright: copyright(),
          youtubeLink: youtubeLink(),
          lyrics: lyrics
        }
      })
      .then(function(res) {
        if (res.errorMessages) {
          errors = res.errorMessages;
          $('#alert')
            .show()
            .delay(2000)
            .fadeOut();
          $('body').scrollTop(0);
        } else {
          window.location.href = res.url;
        }
      });
  }

  let addStanza = {
    view: vnode => {
      let args = vnode.attrs;
      return m('.form-group', [
        m('label', 'Stanza ' + (args.index + 1) + ':'),
        m('textarea.form-control', {
          value: (function() {
            return args.stanza.reduce((prev, curr) => {
              return prev + '\n' + curr;
            });
          })(),
          rows: '5', //the default size of stanza textbox
          oninit: vnode => {
            if (obj.readonly) {
              $(vnode.dom).prop('readonly', true);
            }
            $(vnode.dom).bind('input propertychange', function() {
              //make an array of string
              let newStanza = $(elem).val()
                ? $(elem)
                    .val()
                    .split(/\r?\n/)
                : '';
              //update the object
              lyrics.splice(args.index, 1, newStanza);
            });
          }
        }),
        m(
          'button.btn.btn-default',
          {
            disabled: args.length === 1 ? true : false,
            onclick: function() {
              lyrics.splice(args.index, 1);
            }
          },
          [m('span.glyphicon.glyphicon-minus')]
        ),
        m(
          'button.btn.btn-default',
          {
            onclick: function() {
              lyrics.splice(args.index + 1, 0, ['']);
            }
          },
          [m('span.glyphicon.glyphicon-plus')]
        )
      ]);
    }
  };

  let showingCopypasteModal = false;
  function copypasteModal() {
    return m(
      '.modal[role=dialog]',
      {
        id: 'copypaste' + obj.formID,
        class: showingCopypasteModal ? 'fade in' : 'fade'
      },
      [
        m(
          '.modal-dialog',
          {
            role: 'document'
          },
          [
            m('.modal-content', [
              m('.modal-body', [
                m('label', 'Lyrics:'),
                m('textarea.form-control', {
                  rows: '25',
                  placeholder:
                    'Enter the lyrics of your new song separating each stanza with a blank line. Then press "Done" to start entering other details for the song.',
                  oninit: vnode => {
                    $(vnode.dom).bind('input propertychange', function() {
                      copypaste = $(vnode.dom).val()
                        ? $(elem)
                            .val()
                            .split(/\n\n|\/\//)
                        : '';
                      if (copypaste !== '') {
                        copypaste = copypaste.map(cp => {
                          return cp.split(/\n|\//);
                        });
                      }
                    });
                  },
                  oncreate: vnode => {
                    let id = '#copypaste' + obj.formID;
                    $(id).on('show.bs.modal', () => {
                      showingCopypasteModal = true;
                    });
                    $(id).on('hide.bs.modal', () => {
                      showingCopypasteModal = false;
                    });

                    // auto-open this modal if appropriate
                    if (obj.song.title === '') {
                      $(id).modal('show');
                      m.redraw();
                    }
                  }
                }),
                m(
                  'div',
                  {
                    style: {
                      'text-align': 'right',
                      'margin-top': '5px'
                    }
                  },
                  [
                    m(
                      'button.btn.btn-default',
                      {
                        onclick: function() {
                          $('#copypaste' + obj.formID).modal('hide');
                          $('#copypaste' + obj.formID)
                            .find('textarea')
                            .val('');
                        }
                      },
                      'Cancel'
                    ),
                    m.trust('&nbsp;'),
                    m(
                      'button.btn.btn-primary',
                      {
                        onclick: function() {
                          let isConfirmed = true;
                          $('#stanzas' + obj.formID)
                            .children()
                            .each(function() {
                              if (
                                $(this)
                                  .find('textarea')
                                  .val()
                                  .replace(/\s/g, '') !== ''
                              ) {
                                isConfirmed = confirm(
                                  'Do you want to overwrite your existing lyric ?'
                                );
                                return;
                              }
                            });
                          if (isConfirmed) {
                            lyrics = copypaste;
                            $('#copypaste' + obj.formID).modal('hide');
                            $('#copypaste' + obj.formID)
                              .find('textarea')
                              .val('');
                          }
                        }
                      },
                      'Done'
                    )
                  ]
                )
              ])
            ])
          ]
        )
      ]
    );
  }

  function displayError() {
    if (!isEmpty(errors)) {
      return m(
        '#alert.alert.alert-danger',
        {
          oninit: vnode => {
            $(vnode.dom)
              .delay(3000)
              .fadeOut();
          }
        },
        [
          errors.map(error => {
            return m('p', error);
          })
        ]
      );
    }
  }

  function initReadonly(vnode) {
    if (obj.readonly) {
      $(vnode.dom).prop('readonly', true);
    }
  }

  function initReadonlyWith(val) {
    return vnode => {
      $(vnode.dom).val(val());
      if (obj.readonly) {
        $(vnode.dom).prop('readonly', true);
      }
    };
  }

  let songFormComponent = {
    view: vnode => {
      return [
        displayError(),
        m(
          'div',
          {
            style: {
              'font-size': '15px'
            }
          },
          [
            m('.form-group', [
              m('label', 'Title*'),
              m('input.form-control', {
                placeholder:
                  'Enter the title of the song in the selected language',
                value: title(),
                onchange: m.withAttr('value', title),
                oninit: initReadonly
              })
            ]),
            m('.form-group', [
              m('label', 'Author*'),
              m('input.form-control', {
                placeholder: 'The author(s) and/or composer(s) of the song',
                value: author(),
                onchange: m.withAttr('value', author),
                oninit: initReadonly
              })
            ]),
            m('.form-group', [
              m('label', 'Translator'),
              m('input.form-control', {
                placeholder: 'The translator of the song',
                value: translator(),
                onchange: m.withAttr('value', translator),
                oninit: initReadonly
              })
            ]),
            m('.form-group', [
              m('label', 'Publisher and/or year'),
              m('input.form-control', {
                placeholder:
                  'If the song has a publisher, include the publisher and year',
                value: year(),
                onchange: m.withAttr('value', year),
                oninit: initReadonly
              })
            ]),
            m('.form-group', [
              m('label', 'Language*'),
              m(
                'select.form-control',
                {
                  onchange: m.withAttr('value', lang),
                  oninit: initReadonlyWith(lang)
                },
                [
                  availableLanguages.map(lang => {
                    return m(
                      'option',
                      {
                        value: lang._id
                      },
                      lang.label
                    );
                  })
                ]
              )
            ]),
            m('.form-group', [
              m('label', 'Copyright*'),
              m(
                'select.form-control.capitalize',
                {
                  onchange: m.withAttr('value', copyright),
                  oninit: initReadonlyWith(copyright)
                },
                [
                  copyrightTypes.map(cp => {
                    return m('option', cp);
                  })
                ]
              )
            ]),
            m('.form-group', [
              m('label', 'Youtube Video Link'),
              m('input.form-control', {
                placeholder: 'A link to a video so users can hear the song',
                value: youtubeLink(),
                onchange: m.withAttr('value', youtubeLink),
                oninit: initReadonly
              })
            ]),
            m(
              'div',
              {
                id: 'stanzas' + obj.formID
              },
              [
                lyrics.map((stanza, i, arr) => {
                  return m(addStanza, {
                    stanza: stanza,
                    index: i,
                    length: arr.length
                  });
                })
              ]
            )
          ]
        ),
        obj.submitButton
          ? m(
              'button.btn.btn-primary',
              {
                onclick: addSong
              },
              'Submit'
            )
          : null,
        copypasteModal()
      ];
    }
  };

  return songFormComponent;
}

export default songForm;
