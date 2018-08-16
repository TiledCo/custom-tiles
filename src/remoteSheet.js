import React, { Component } from 'react'
import { render } from 'react-dom'

const api = window.tiledAPI
const tile = document.getElementById('tile')

const fetch = function(url, cb) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      cb(JSON.parse(xhttp.responseText))
    }
  }
  xhttp.open('GET', url, true)
  xhttp.send()
}

class RemoteSheet extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false,
      sheets: []
    }
  }

  componentWillMount() {
    const { sheetId, apiKey } = this.props
    if (!sheetId || !apiKey) {
      console.log('Missing sheetId or apiKey')
      return false
    }

    const apiURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}&includeGridData=true`
    fetch(apiURL, (response) => {
      this.setState({
        sheets: response.sheets.map(this.formatSheetData),
        loaded: true
      })
    })
  }

  formatSheetData(data) {
    const row = data.data.pop()
    const sheetData = {
      title: data.properties.title,
      data: row.rowData.map((rowData) => {
        return rowData.values ?
          rowData.values.map(value => value.formattedValue) :
          []
      })
    }

    return sheetData
  }

  render() {
    const { sheetId, apiKey } = this.props
    const { sheets, loaded } = this.state

    if (!sheetId || !apiKey) {
      return (<div>Please specify a valid `sheetId` and a valid `apiKey`</div>)
    }

    return (
      <div>
        {!loaded && 'Loading...'}
        {loaded &&
          <div key={`sheet-data-${sheetId}`}>
            {sheets.map((sheet) => {
              return (
                <ol key={`sheet-data-${sheetId}`}>
                  {sheet.data.map((row) => {
                    return <li><ul>{row.map(item => <li>{item}</li>)}</ul></li>
                  })}
                </ol>
              )
            })}
          </div>
        }
      </div>
    )
  }
}

render(
  <RemoteSheet
    sheetId={api.props.sheetId}
    apiKey={api.props.apiKey}
  />,
  tile
)
