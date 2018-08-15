var fetch = function(url, cb) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      cb(JSON.parse(xhttp.responseText));
    }
  };
  xhttp.open('GET', url, true);
  xhttp.send();
}

var $ = window.tiledAPI;

try {
  var tile = document.getElementById('tile');
  tile.innerHTML = '';
  tile.style.backgroundColor = 'rgba(255,77,0,0.9)';

  tile.addEventListener('click', function() {
    $.runAction({
      type: 'l',
      target: '57239d46552d94e0063a9348',
      transition: 's'
    });
  }, false)

  var img = new Image();
  img.src = 'http://static.rasset.ie/static/news/img/weather/icons/clear-weather-sun.png';
  img.width = 200;
  img.style.position = 'relative';
  img.style.display = 'block';
  img.style.margin = '0 auto';
  img.style.top = '40px';
  tile.appendChild(img);

  var city = document.createElement('div');
  city.style.position = 'absolute';
  city.style.bottom = '20px';
  city.style.left = '20px';
  city.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  city.style.fontSize = '28px';
  city.style.fontWeight = '200';
  city.style.lineHeight = '1';
  city.style.color = 'white';
  tile.appendChild(city);

  var temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.bottom = '20px';
  temp.style.right = '20px';
  temp.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  temp.style.fontSize = '72px';
  temp.style.fontWeight = '200';
  temp.style.lineHeight = '1';
  temp.style.color = 'white';
  tile.appendChild(temp);

  var locationString = $.storage.get('location');
  var tempString = $.storage.get('temperature');
  if (tempString && locationString) {
    city.innerText = locationString;
    temp.innerHTML = tempString;
  }
  else {
    $.log('sending request');
    fetch('http://ip-api.com/json', function(loc) {
      city.innerText = $.storage.set('location', loc.city + ', ' + loc.region);
      fetch('http://api.wunderground.com/api/c6ac5662259d0acc/features/conditions/q/' + loc.zip + '.json', function(data) {
        temp.innerHTML = $.storage.set('temperature', parseInt(data.current_observation.temp_f, 10) + '&deg;');
      });
    });
  }
}
catch(e) {
  $.log(JSON.stringify(e))
}
