function contact() {
    var email = m.prop()
    var subject = m.prop()
    var message = m.prop()

    function submitMessage() {
        m.request({
            method: 'post',
            url: '/contact',
            data: {
                email: email,
                subjec
            }
        })
    }

    var contactComponent = {
        view: function() {
            return m('.panel.panel-default', {
                style: {
                    width: '525px',
                    margin: 'auto'
                }
            }, [
                m('.panel-body', [
                    m('h2', 'Contact Us'),
                    m('label', 'Email:'),
                    m('input.form-control', {
                        placeholder: 'you@domain.com',
                        onchange: m.withAttr('value', email)
                    })
                    m('label', 'Your Message:')
                    m('input.form-control', {
                        placeholder: 'Subject (optional but helpful)',
                        onchange: m.withAttr('value', subject)
                    })
                    m('textarea.form-control', {
                        style: {
                            height: '100px',
                            'margin-top': '4px'
                        },
                        config: function(elem, isInit) {
                            if (!isInit) {
                                $(elem).bind('input propertychange', function() {

                                });
                            }
                        }
                    }),
                    m('button.btn.btn-default', {
                        onclick: function() {
                            submitMessage()
                        }
                    }, 'Submit')
                ])
            ])
        }
    }

}
