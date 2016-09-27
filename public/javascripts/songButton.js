var setSong = function(id) {
    m.request({
            method: 'POST',
            url: '/songlist',
            data: {
                id: id
            }
        })
        .then(function(data) {
            if (data.url) {
                window.location.href = data.url
            } else {
                info(data.msg)
                console.log(data.msg)
                console.log(data.status)
                infoStatus(data.status)
            }
        })
}
var showInfo = function(elem) {
    $(elem).click(function() {
        console.log(infoStatus())
        $('#info').show()
        $("#info").fadeTo(1000, 500).slideUp(500, function() {
            $(this).slideUp(500);
        });
    })

}
var info = m.prop()
var infoStatus = m.prop('')
var songButton = {
    view: function() {
        return [m('#info.alert[style=display:none]', {
                class: infoStatus()
            }, info()),
            m('button.btn.btn-success', {
                config: function(elem, isInit, context) {
                    if (!isInit) {
                        showInfo(elem);
                    }
                },
                onclick: function() {
                    setSong(song._id)
                }
            }, 'Add to Library')
        ]
    }
}

var transButton = {
    view: function() {
        return [m('#info.alert[style=display:none]', {
                class: infoStatus()
            }, info()),
            m('button.btn.btn-success', {
                config: function(elem, isInit, context) {
                    if (!isInit) {
                        showInfo(elem);
                    }
                },
                onclick: function() {
                    setSong(translation._id)
                }
            }, 'Add to Library')
        ]
    }
}
m.mount(document.getElementById('song'), songButton)
m.mount(document.getElementById('translation'), transButton)
