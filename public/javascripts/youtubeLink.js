/*
  youtube link always has 'v={code}' in the url where a unique code refers to a video.
  in order to be able to embed youtube video in html we need to include iframe element with
  src='https://www.youtube.com/embed/{code}'.
  therefore we need to to extract only the code from youtube url.
  there are two cases of youtube link:
      1. https://www.youtube.com/watch?v=O0VN0pGgBZM&t=180s
         in this case we need to get the substring until the index of '&'
      2. https://www.youtube.com/watch?v=O0VN0pGgBZM
         in this case we need to get the subtring until the end of the string
  this function will take original youtube link and return the embed link that we need to put in html
*/
function encoder(youtubeLink) {
    if (youtubeLink === '') {
        return youtubeLink
    } else {
        var stringIndicator = 'v='
        var startIndex = youtubeLink.indexOf(stringIndicator) + stringIndicator.length;
        var endIndex = youtubeLink.indexOf('&');
        var embedLink = 'https://www.youtube.com/embed/';
        if (endIndex !== -1) {
            return embedLink + youtubeLink.substring(startIndex, endIndex);
        } else {
            return embedLink + youtubeLink.substring(startIndex);
        }
    }
}


//this function takes the embed link and return the original youtube link
function decoder(embedLink) {
    if (embedLink === '') {
        return embedLink;
    } else {
        var stringIndicator = 'embed/'
        var startIndex = embedLink.indexOf(stringIndicator) + stringIndicator.length;
        var youtubeLink = 'https://www.youtube.com/watch?v=';
        return youtubeLink + embedLink.substring(startIndex);
    }
}
