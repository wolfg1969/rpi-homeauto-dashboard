export const GET_BING_WALLPAPER = 'GET_BING_WALLPAPER';

const bingHostURL = 'https://cn.bing.com';

export const getBingWallpaper = () => {
  return dispatch => {
    
    fetch(`http://start.home.lan:8083/proxy/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    }).then(
      response => response.json()
    ).then(
      data => data.images[0]
    ).then(
      data => {
        const { url, title } = data;

        var imageUrl = `${bingHostURL}${url.replace("_1920x1080", "_1080x1920")}`;
        
        dispatch({ 
          type: GET_BING_WALLPAPER,
          payload: {
            url: imageUrl,
            title,
          }
        })

        var style = document.body.style;
        style.setProperty('--background', 'url(' + imageUrl + ') no-repeat center center fixed');
      }
    ).catch(error => console.error(error));
  }
};
