var list = $('.opt').eq(1)
    // .css('background-color', 'red')

$("#demo").sortable({
    /*stop: function(event, ui) {
        alert("New position: " + ui.item.index());
    }*/
    start: function(e, ui) {
        // creates a temporary attribute on the element with the old index
        $(this).attr('data-previndex', ui.item.index());
    },
    update: function(e, ui) {
        // gets the new and old index then removes the temporary attribute
        var newIndex = ui.item.index();
        var oldIndex = $(this).attr('data-previndex');
        var element_id = ui.item.attr('id');
        alert('id of Item moved = ' + element_id + ' old position = ' + oldIndex + ' new position = ' + newIndex);
        $(this).removeAttr('data-previndex');
    }
});
$("#sortable").disableSelection();

// m.request({method: "POST", url: "/export-2/", data: list})
//     .then(function(response) {
//         console.log(response) // {id: 1, name: "John", email: "johndoe@example.com"}
//     })