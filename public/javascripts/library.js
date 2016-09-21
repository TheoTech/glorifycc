$(document).ready(function(){

    for(var i = 0; i < songs.length; i++){
        $('#' + songs[i]._id).click(function(){
            console.log('hehhe')
            $(this).hide()
          })
        }
})
