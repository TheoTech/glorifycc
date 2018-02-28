'use strict';
import m from 'mithril';

const showSongsIn = {
  view: function(vnode) {
    let args = vnode.attrs;
    return m('div', [
      m('h5', 'Show songs in: ', [
        m('.btn-group', [
          m(
            'button.btn.btn-default.dropdown-toggle[type=button].capitalize',
            {
              'data-toggle': 'dropdown',
              'aria-haspopup': 'true',
              'aria-expanded': 'false'
            },
            args.langShownLabel(),
            [m('span.caret')]
          ),
          m('ul.dropdown-menu', [
            m('li', [
              m(
                'a',
                {
                  href: '#',
                  onclick: function() {
                    args.langShown('all');
                    args.langShownLabel('All Languages');
                    args.loadMoreAndApplyFilter(
                      args.initial,
                      args.langShown(),
                      args.langFilter(),
                      args.searchString()
                    );
                  }
                },
                'All Languages'
              )
            ]),
            args.langsExist.map(lang => {
              return m('li', [
                m(
                  'a',
                  {
                    href: '#',
                    onclick: function() {
                      args.langShown(lang._id);
                      args.langShownLabel(lang.label);
                      args.loadMoreAndApplyFilter(
                        args.initial,
                        args.langShown(),
                        args.langFilter(),
                        args.searchString()
                      );
                    }
                  },
                  lang.label
                )
              ]);
            })
          ])
        ])
      ])
    ]);
  }
};

export default showSongsIn;
