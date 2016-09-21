var searchOption = {
    queryString: function() {
        var url = ''
        var lang = this.optionChecked() || []
        // console.log(lang)
        if (lang[0]) {
            url += '?lang=' + lang[0];
        }
        for (var i = 1; i < lang.length; i++) {
            url += '&lang=' + lang[i];
        }
        return url;
    },
    option: [{
        checked: m.prop(false),
        value: 'english'
    }, {
        checked: m.prop(false),
        value: 'mandarin'
    }, {
        checked: m.prop(false),
        value: 'spanish'
    }, {
        checked: m.prop(false),
        value: 'portuguese'
    }],
    optionChecked: function() {
        return this.option.filter((opt) => opt.checked() === true)
            .map((opt) => opt.value)
    },
    view: function() {
        return [
            m('h4', 'Search Option:'),
            m('form', [
                this.option.map(function(opt) {
                    return m('label.checkbox-inline', [
                        m('input[type=checkbox]', {
                            checked: opt.checked(),
                            onclick: m.withAttr('checked', opt.checked)
                        }),
                        m('span.capitalize', opt.value)
                    ])
                })
            ]),
            m('a.btn.btn-default', {href: '/songlist' + this.queryString()}, 'Filter')
        ]
    }
}

m.module(document.getElementById('search-option'), searchOption)
