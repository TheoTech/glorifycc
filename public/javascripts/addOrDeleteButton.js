var addOrDeleteButtonComponent = (function() {
    var addSong = function(id, url, inLibrary) {
        m.request({
            method: 'POST',
            url: url,
            data: {
                id: id
            }
        }).then(function(res) {
            res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
        })
    }

    var deleteSong = function(id, url, inLibrary) {
        m.request({
            method: 'DELETE',
            url: url,
            data: {
                id: id
            }
        }).then(function(res) {
            res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
        })
    }

    var addOrDeleteButton = {
        // controller: function(args) {
        //     var ctrl = this
        //     this.isInLibrary = _.includes(args.inLibrary(), args.songID)
        // },
        view: function(ctrl, args) {
            return m('div', [
                m('button#addOrDelete.btn.btn-default', {
                    'data-toggle': 'tooltip',
                    'data-placement': 'right',
                    title: _.includes(args.inLibrary(), args.songID) ? 'Delete from Library' : 'Add to Library',
                    onclick: function() {
                        if(_.includes(args.inLibrary(), args.songID)){
                          deleteSong(args.songID, args.url, args.inLibrary)
                          $('p#' + args.songID).text('Remove from library...')
                          setTimeout(() => {
                              $('p#' + args.songID).text('')
                              // m.redraw()
                          }, 3000);
                        } else {
                          addSong(args.songID, args.url, args.inLibrary)
                          $('p#' + args.songID).text('Add to library...')
                          setTimeout(() => {
                              $('p#' + args.songID).text('')
                          }, 3000);
                        }

                    },
                    config: function(elem, isInit) {
                        if (!isInit) {
                            $(elem).tooltip({
                                trigger: 'hover'
                            })
                        } else {
                            $(elem).tooltip('hide').attr('title', $(elem).title)
                                .tooltip('fixTitle')
                                .tooltip({
                                    trigger: 'hover'
                                })
                        }
                    }
                }, [
                    m(_.includes(args.inLibrary(), args.songID) ? 'i.glyphicon.glyphicon-remove' : 'i.glyphicon.glyphicon-plus')
                ]),
                m('p', {
                    id: args.songID,
                    style: {
                        display: 'inline-block',
                        'font-style': 'italic',
                        'margin-left': '3px'
                    }
                })
            ])
        }
    }


    return {
        addOrDeleteButton: addOrDeleteButton
    }
})()
