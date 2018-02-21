'use strict';

import $ from 'jquery';
import m from 'mithril';
import prop from 'mithril/stream';

let searchString = prop('');
const enter = elem => {
  $(elem).keyup(e => {
    if (e.keyCode === 13) {
      $('#search-button').click();
    }
  });
};

const searchBoxHome = {
  view: function() {
    return m(
      '#searchInput.input-group',
      {
        style: {
          width: '100%'
        }
      },
      [
        m('input.form-control[type=text]', {
          placeholder: 'Search by title, lyrics or author',
          onchange: m.withAttr('value', searchString),
          oncreate: vnode => {
            enter(vnode.dom);
          }
        }),
        m('span.input-group-btn', [
          m(
            'button#search-button.btn.btn-success',
            {
              onclick: function() {
                window.location.href = '/search?q=' + searchString();
              }
            },
            [m('i.glyphicon.glyphicon-search')]
          )
        ])
      ]
    );
  }
};

export default searchBoxHome;
