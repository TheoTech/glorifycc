$('#delete').on('click', function(e) {
      e.preventDefault();

      $('input:checked').each(function(index, value) {
          var val = $(this).attr('id');
          // console.log(JSON.stringify(val));
          // console.log($(this));
          var $thisInput = $(this);

          $.ajax({
              url: '/songcart/' + val,
              type: 'DELETE'
          }).done(function() {
              $thisInput.parents('tr').remove();
          });
      });
})
