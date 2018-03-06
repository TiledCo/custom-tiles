import React, { Component } from 'react'
import { render } from 'react-dom'

const fetch = function(url, cb) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      cb(JSON.parse(xhttp.responseText))
    }
  };
  xhttp.open('GET', url, true)
  xhttp.send()
}

const $ = window.tiledAPI
const tile = document.getElementById('tile')

tile.style.backgroundColor = 'rgba(255,77,0,0.9)'

class WeatherTile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      city: $.storage.get('location', ''),
      temp: $.storage.get('temperature', ''),
    }
  }

  componentWillMount() {
    const { city, temp } = this.state
    if (!(city && temp)) {
      $.log('sending request');
      fetch('http://ip-api.com/json', (loc) => {
        this.setState({
          city: $.storage.set('location', loc.city + ', ' + loc.region)
        })

        fetch('http://api.wunderground.com/api/c6ac5662259d0acc/features/conditions/q/' + loc.zip + '.json', (data) => {
          this.setState({
            temp: $.storage.set('temperature', parseInt(data.current_observation.temp_f, 10) + '°')
          })
        });
      });
    }
  }

  render() {
    return (
      <div style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: 'white',
      }}>
        <img
          src="http://static.rasset.ie/static/news/img/weather/icons/clear-weather-sun.png"
          width="200"
          style={{
            position: 'relative',
            display: 'block',
            margin: '0 auto',
            top: 40,
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          fontSize: 28,
          fontWeight: 200,
          lineHeight: 1,
        }}>
          {this.state.city}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          fontSize: 72,
          fontWeight: 200,
          lineHeight: 1,
        }}>
          {this.state.temp}
        </div>
      </div>
    )
  }
}

render((<WeatherTile />), tile)
