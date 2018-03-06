'use strict'

const _ = require('lodash')
const fs = require('fs')
const express = require('express')
const app = express()
const moment = require('moment')
const config = require('./config')
const tiles = require('./tiles.json').tiles
const now = Date.now()
const request = require('request')
const commaNumber = require('comma-number')

const Pageres = require('pageres')

const CALENDAR_FORMATTER = {
  sameDay: 'h:mm A',
  nextDay: '[Tomorrow at] h:mm A',
  nextWeek: 'dddd [at] h:mm A',
  lastDay: '[Yesterday at] h:mm A',
  lastWeek: '[Last] dddd [at] h:mm A',
  sameElse: 'M/DD/YYYY [at] h:mm A'
}

const PREVIEW_SIZES = _.flatMap([1600, 800, 400, 200, 100], size => {
  return [
    {
      width: size,
      height: size,
    },
    {
      width: Math.round(size * 0.75),
      height: size,
    },
    {
      width: Math.round(size * 0.5),
      height: size,
    },
    {
      width: size,
      height: Math.round(size * 0.75),
    },
    {
      width: size,
      height: Math.round(size * 0.5),
    }
  ]
})

// normalize and format tile data from JSON
tiles.forEach(tile => {
  tile.id = tile.id.replace(/[^a-zA-Z0-9_\.-]+/g, '_')

  tile.devPath = `${__dirname}/dist/${tile.id}/bundle.js`
  tile.minPath = `${__dirname}/dist/${tile.id}/bundle.min.js`
  tile.devUrl = `./dist/${tile.id}/bundle.js`
  tile.minUrl = `./dist/${tile.id}/bundle.min.js`

  tile.previews = PREVIEW_SIZES.map(size => {
    const name = `preview@${size.width}x${size.height}.png`
    return {
      name: name,
      url: `./dist/${tile.id}/${name}`,
      width: size.width,
      height: size.height,
      path: `${__dirname}/dist/${tile.id}/${name}`
    }
  })

  try {
    const devStat = fs.statSync(tile.devPath)
    tile.devModified = moment(devStat.mtime).calendar(null, CALENDAR_FORMATTER)
    tile.devSize = commaNumber(devStat.size)
  }
  catch(e) {
    tile.devModified = 'never'
    tile.devSize = 0
  }

  try {
    const minStat = fs.statSync(tile.minPath)
    tile.minModified = moment(minStat.mtime).calendar(null, CALENDAR_FORMATTER)
    tile.minSize = commaNumber(minStat.size)
  }
  catch(e) {
    tile.minModified = 'never'
    tile.minSize = 0
  }
})

app.disable('x-powered-by')

app.set('views', __dirname + '/views')
app.set('view engine', 'hjs')

app.use('/assets', express.static(__dirname + '/assets'))
app.use('/dist', express.static(__dirname + '/dist'))

app.get('/loadtime', (req, res, next) => {
  res.json({
    time: now,
  })
})

app.get('/tile/:id/previews', (req, res, next) => {
  const renderUrl = 'http://localhost:3003/tile/' + req.params.id + '?useMin=true'
  const pageres = new Pageres({delay: 5})
    .dest(__dirname + '/dist/' + req.params.id)
    .src(renderUrl, PREVIEW_SIZES.map(size => `${size.width}x${size.height}`), {filename: 'preview@<%= size %>', crop: true})
    .on('warn', function(error){
      console.log(error)
    })
    .run()
    .then(() => {
      res.json({ done: true })
      console.log("done generating previews")
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
})

app.get('/tile/:id/viewer', (req, res, next) => {
  res.render('tile-viewer', {
    tile: tiles.find(t => t.id === req.params.id)
  })
})

app.get('/tile/:id', (req, res, next) => {
  const tile = tiles.find(t => t.id === req.params.id)
  res.render('tile', {
    tile: tile,
    enums: JSON.stringify(enums),
    props: JSON.stringify(_.mapValues(tile.propDef || {}, (value) => {
      if (_.isPlainObject(value)) {
        return value.default
      }
    })),
    useMin: !!req.query.useMin
  })
})

app.get('/tile/:id/bundle', (req, res, next) => {
  const tile = tiles.find(t => t.id === req.params.id)
  if (tile && tile.minSize) {
    res.json({
      id: tile.id,
      name: tile.name,
      shortName: tile.shortName || tile.name,
      global: !!tile.global,
      propDef: tile.propDef || {},
      // previews: tile.previews.map(preview => {
      //   preview.base64 = new Buffer(fs.readFileSync(preview.path)).toString('base64')
      //   return _.pick(preview, ['base64', 'name', 'width', 'height'])
      // }),
      asset: {
        name: 'bundle.min.js',
        size: tile.minSize,
        base64: new Buffer(fs.readFileSync(tile.minPath)).toString('base64'),
      }
    })
  }
  else {
    res.status(404).send()
  }
})

app.get('/', (req, res, next) => {
  res.render('index', {
    tiles: tiles.map(tile => {
      return _.assign({}, tile, {
        previews: _.values(_.groupBy(tile.previews, preview => 'max' + Math.max(preview.width, preview.height))).map(previewGroup => {
          const groups = _.partition(previewGroup, preview => preview.height === previewGroup[0].height)
          return {
            sameHeight: groups[0],
            sameWidth: groups[1]
          }
        })
      })
    })
  })
})

app.use((err, req, res, next) => {
  console.error(err)

  err = err || { message: 'Can\'t find what you need. :(' }

  res.status(err.status || 500).json({
    error: {
      type: err.name,
      status: err.status || 500,
      message: err.message
    }
  })
})

app.listen(config.port, () => {
  console.log(`Run "npm run start-webpack" then go to: http://localhost:${config.port}`);
})
