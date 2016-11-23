var addOrDeleteButtonComponent = (function() {
    var addSong = function(id, url, inLibrary) {
        m.request({
            method: 'POST',
            url: url,
            data: {
                id: id
            }
        }).then(function(res) {
            inLibrary(res.inLibrary)
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
            inLibrary(res.inLibrary)
        })
    }

    /*
      args = {songID: args._id,
              url: '/',
              inLibrary: inLibrary
    }
    */
    var addOrDeleteButton = {
        controller: function(args) {
            console.log(args.inLibrary())
            this.buttonTitle = function() {
                var isInLibrary = _.includes(args.inLibrary(), args.songID);
                return isInLibrary ? 'Removing from Library...' : 'Adding to Library...';
            };
            this.buttonTxt = function() {
                var isInLibrary = _.includes(args.inLibrary(), args.songID);
                return m(isInLibrary ? 'i.glyphicon.glyphicon-remove' : 'i.glyphicon.glyphicon-plus');
            }
            this.addOrDelete = function(){
                var isInLibrary = _.includes(args.inLibrary(), args.songID);
                if (isInLibrary) {
                    deleteSong(args.songID, args.url, args.inLibrary)
                } else {
                    addSong(args.songID, args.url, args.inLibrary)
                }
            }
            return this;
        },
        view: function(ctrl, args) {
            return m('div', [
                m('button.btn.btn-default', {
                    title: ctrl.buttonTitle(),
                    onclick: function() {
                        if (!isLoggedIn) {
                            window.location.href = '/user/login'
                        } else {
                            ctrl.addOrDelete()
                            $(this).tooltip('fixTitle');
                            $(this).tooltip('show')
                            setTimeout(() => {
                              $(this).tooltip('hide')
                            }, 2000);
                        }
                    },
                    config: function(elem, isInit) {
                        if (!isInit) {
                            $(elem).tooltip({
                                trigger: 'manual'
                            });
                        }
                    }
                }, [
                    ctrl.buttonTxt()
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
