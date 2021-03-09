function mungePlaylist(someData) {
 
  const playlistArr = someData.items.map(item => {
    return {
      playlist_id: item.id,
      name: item.name,
      uri: item.uri
    };
  });
  return playlistArr;
}
    
module.exports = {
  mungePlaylist,
};