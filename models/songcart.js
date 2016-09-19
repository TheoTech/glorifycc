module.exports = function Cart(oldCart){
  this.songs = oldCart
  this.add = function(songs){
    songs.push(id)
  }
}


// module.exports = function Cart(oldCart) {
//     this.songs = oldCart.songs;
//
//     this.add = function(id) {
//         var storedItem = this.songs[id]
//         if (!storedItem) {
//             storedItem = this.songs[id] = {
//                 song: song,
//                 quantity: 0
//             }
//         }
//         storedItem.quantity++
//     }
//     this.generateArray = function() {
//         var arr = [];
//         for (var id in this.songs) {
//             arr.push(this.songs[id]);
//         }
//         return arr;
//     }
// }
