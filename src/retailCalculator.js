import { h, render, Component } from 'preact';
// Tell Babel to transform JSX into h() calls:
/** @jsx h */

const $ = window.tiledAPI
const tile = document.getElementById('tile')

tile.style.backgroundColor = 'white'

const HANDLE_SIZE = 64
const HANDLE_D = 32
const ORANGE = '#FD7F2A'

const p = (px) => {
  return `${(100 * px / 768).toFixed(3)}vmin`
}

class Slider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value || 0,
    }

    this.onPointerStart = this.onPointerStart.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerEnd = this.onPointerEnd.bind(this)
  }

  componentDidMount() {
    this._width = this.base.getBoundingClientRect().width
  }

  eventCoords(e) {
    const touch = (e.touches || [])[0] || {}
    return {
      x: Math.round(e.clientX || touch.clientX || 0),
      y: Math.round(e.clientY || touch.clientY || 0),
    }
  }

  onPointerStart(e) {
    this._pointerStart = this.eventCoords(e)
    this._startValue = this.state.value

    document.removeEventListener('mousemove', this.onPointerMove, false)
    document.removeEventListener('touchmove', this.onPointerMove, false)
    document.removeEventListener('mouseup', this.onPointerEnd, false)
    document.removeEventListener('touchend', this.onPointerEnd, false)

    document.addEventListener('mousemove', this.onPointerMove, false)
    document.addEventListener('touchmove', this.onPointerMove, false)
    document.addEventListener('mouseup', this.onPointerEnd, false)
    document.addEventListener('touchend', this.onPointerEnd, false)

    $.captureTouch && $.captureTouch()
  }

  onPointerMove(e) {
    e.stopPropagation()
    e.preventDefault()
    const { min, max } = this.props
    const coord = this.eventCoords(e)
    const dx = coord.x - this._pointerStart.x
    const dVal = ((max || 1) - (min || 0)) * dx / this._width
    const newValue = Math.round(Math.max(min || 0, Math.min(this._startValue + dVal, max || 1)))

    this.props.onChange && this.props.onChange(newValue)
    this.setState({
      value: newValue,
    })
  }

  onPointerEnd() {
    document.removeEventListener('mousemove', this.onPointerMove, false)
    document.removeEventListener('touchmove', this.onPointerMove, false)
    document.removeEventListener('mouseup', this.onPointerEnd, false)
    document.removeEventListener('touchend', this.onPointerEnd, false)
  }

  render({ min, max, shiftRight, displayFactor, sm, suffix }, { value }) {
    const left = 100 * (value - (min || 0)) / ((max || 1) - (min || 0))
    displayFactor = displayFactor || 1
    suffix = suffix || ''

    const shiftThreshold = sm ? 90 : 75

    return (
      <div
        style={Object.assign({
          position: 'relative',
          height: p(HANDLE_SIZE),
          marginRight: p(HANDLE_SIZE),
        }, this.props.style)}
      >
        <div
          style={{
            position: 'absolute',
            height: p(2),
            top: p((HANDLE_SIZE - 2) / 2),
            left: p(HANDLE_SIZE / 2),
            right: p(-HANDLE_SIZE / 2),
            backgroundColor: ORANGE,
            borderRadius: p(1),
          }}
        />
        <div
          onTouchStart={this.onPointerStart}
          onMouseDown={this.onPointerStart}
          style={{
            position: 'absolute',
            width: p(HANDLE_SIZE),
            height: p(HANDLE_SIZE),
            left: left + '%',
            top: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: p((HANDLE_SIZE + HANDLE_D) / 2 + 12),
            left: '50%',
            width: p(140),
            marginLeft: (shiftRight && (left > shiftThreshold)) ? p((2 * shiftThreshold - 70) - 2 * left) : p(-70),
            fontSize: p(sm ? 28 : 56),
            color: ORANGE,
            textAlign: 'center',
            pointerEvents: 'none',
          }}>{displayFactor < 1 ? (value * displayFactor).toFixed(1) : Math.round(value * displayFactor)}{suffix}</div>
          <div style={{
            position: 'absolute',
            width: p(HANDLE_D),
            height: p(HANDLE_D),
            left: p((HANDLE_SIZE - HANDLE_D) / 2),
            top: p((HANDLE_SIZE - HANDLE_D) / 2),
            borderRadius: p(HANDLE_D / 2),
            backgroundColor: 'white',
            border: ORANGE + ' solid ' + p(2),
            boxSizing: 'border-box',
            boxShadow: '0 1px 6px 0 rgba(0,0,0,0.2)',
          }}/>
        </div>
      </div>
    )
  }
}

class CustomTile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ppaInstalls: 17,
      // loanInstalls: 8,
      loanInstalls: 0,
      avgSystemSize: 6,
      ca: false,
    }
  }

  componentDidMount() {
    $.onLoad()
  }

  installCommission(ppaInstalls, loanInstalls, avgSystemSize) {
    const { ca } = this.state
    const ppa = avgSystemSize * ppaInstalls * (ca ? 265 : 210)
    const loan = avgSystemSize * loanInstalls * (ca ? 315 : 260)

    return ppa + loan
  }

  backendCommission(installs) {
    const { ca } = this.state

    if (installs < 9 * 4) {
      return 0
    }
    if (installs < 15 * 4) {
      return (ca ? 325 : 250) * installs
    }
    if (installs < 21 * 4) {
      return (ca ? 500 : 400) * installs
    }
    if (installs < 28 * 4) {
      return (ca ? 700 : 550) * installs
    }
    if (installs < 35 * 4) {
      return (ca ? 950 : 700) * installs
    }

    return (ca ? 1250 : 850) * installs
  }

  formatMoney(value, omitDollarSign = false) {
    return (omitDollarSign ? '' : '$') + Math.round(value).toString().split('').map((char, i, chars) => {
      if (i > 0 && (chars.length - i) % 3 === 0) {
        return ',' + char
      }
      return char
    }).join('')
  }

  renderHeader({ ca }) {
    return (
      <div style={styles.header}>
        <div style={styles.buttonsRight}>
          <div style={ca ? styles.activeBtn : styles.btn}
            onClick={() => this.setState({ ca: true })}>
            CA
          </div>
          <div style={ca ? styles.btn : styles.activeBtn}
            onClick={() => this.setState({ ca: false })}>
            NON CA
          </div>
        </div>
      </div>
    )
  }

  render(props, { ppaInstalls, loanInstalls, avgSystemSize }) {
    return (
      <div style={styles.root}>
        <div style={styles.header} />
        <div style={styles.hero}>
          <div style={styles.heroLabel}>
            Total annual commissions
          </div>
          <div style={styles.heroBody}>
            <span style={styles.dollarSign}>$</span>
            {this.formatMoney(
              this.installCommission(4 * ppaInstalls, 4 * loanInstalls, avgSystemSize) +
              this.backendCommission(4 * (ppaInstalls + loanInstalls)),
              true
            )}
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}>
            <div style={styles.tile}>
              <div style={styles.tileLabel}>
                Total installs
              </div>
              <div style={styles.tileBody}>
                {4 * (ppaInstalls + loanInstalls)}
              </div>
            </div>
          </div>
          <div style={styles.col}>
            <div style={styles.tile}>
              <div style={styles.tileLabel}>
                Install commission
              </div>
              <div style={styles.tileBody}>
                {this.formatMoney(this.installCommission(4 * ppaInstalls, 4 * loanInstalls, avgSystemSize))}
              </div>
            </div>
          </div>
          <div style={styles.col}>
            <div style={Object.assign({}, styles.tile, { borderRight: 'none' })}>
              <div style={styles.tileLabel}>
                Backend commission
              </div>
              <div style={styles.tileBody}>
                {this.formatMoney(this.backendCommission(4 * (ppaInstalls + loanInstalls)))}
              </div>
            </div>
          </div>
        </div>
        <div style={styles.footer}>
          <div style={styles.sliderRow}>
            <div style={styles.sliderCol}>
              <Slider
                key="smppa"
                min={0}
                max={70}
                value={ppaInstalls}
                onChange={(val) => this.setState({ ppaInstalls: val })}
                style={styles.slider}
              />
              <div style={styles.sliderLabel}>PPA / Lease installs per quarter</div>
            </div>
            {/*}
            <div style={styles.sliderCol}>
              <Slider
                key="smloan"
                min={0}
                max={70}
                value={loanInstalls}
                onChange={(val) => this.setState({ loanInstalls: val })}
                style={styles.slider}
              />
              <div style={styles.sliderLabel}>Loan installs per quarter</div>
            </div>*/}
            <div style={styles.sliderCol}>
              <Slider
                key="smavg"
                min={3}
                max={15}
                shiftRight={true}
                value={avgSystemSize}
                onChange={(val) => this.setState({ avgSystemSize: val })}
                style={styles.slider}
              />
              <div style={styles.sliderLabel}>Average system size</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: 'white',
    fontSize: p(12),
    WebkitUserSelect: 'none',
  },
  header: {
    position: 'relative',
    height: p(80),
    backgroundColor: ORANGE,
    color: 'white',
  },
  buttonsLeft: {
    position: 'absolute',
    left: p(24),
    bottom: 0,
  },
  buttonsRight: {
    position: 'absolute',
    right: p(24),
    bottom: 0,
  },
  activeBtn: {
    display: 'inline-block',
    verticalAlign: 'top',
    padding: `0 ${p(24)}`,
    fontSize: p(15),
    fontWeight: 800,
    lineHeight: p(50),
    borderBottom: `${p(8)} solid white`,
    cursor: 'pointer',
  },
  btn: {
    display: 'inline-block',
    verticalAlign: 'top',
    padding: `0 ${p(24)}`,
    fontSize: p(15),
    lineHeight: p(50),
    borderBottom: `${p(8)} solid transparent`,
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
  },
  hero: {
    padding: `${p(70-45)} 0 0`,
    textAlign: 'center',
  },
  heroLabel: {
    fontSize: p(20),
    textTransform: 'uppercase',
    fontWeight: 800,
    color: ORANGE,
  },
  heroBody: {
    fontSize: p(144),
    color: '#4D4D4D',
  },
  dollarSign: {
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: p(14),
    marginRight: p(4),
    fontSize: p(76),
    fontWeight: 800,
  },
  row: {
    display: 'flex',
    marginLeft: p(24),
    marginRight: p(24),
  },
  col: {
    flex: '1 1 auto',
  },
  tile: {
    borderRight: '#e6e6e6 solid 1px',
    padding: p(10),
    textAlign: 'center',
  },
  tileLabel: {
    fontSize: p(13),
    textTransform: 'uppercase',
    color: '#4D4D4D',
    fontWeight: 800,
    opacity: 0.42,
  },
  tileBody: {
    fontSize: p(38),
    color: '#4d4d4d',
    marginTop: p(14),
  },
  footer: {
    height: p(304),
    backgroundColor: '#F2F2F2',
  },
  sliderRow: {
    display: 'flex',
    height: p(274),
    paddingTop: p(30),
  },
  sliderRowSm: {
    display: 'flex',
    height: p(137),
    paddingTop: p(15),
  },
  sliderCol: {
    flex: '1 1 0',
  },
  slider: {
    marginTop: p(90 - 16),
  },
  sliderSm: {
    marginTop: p(45 - 16),
  },
  sliderLabel: {
    fontSize: p(13),
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#4D4D4D',
    fontWeight: 800,
    opacity: 0.6,
    marginTop: p(10),
  }
}

render((<CustomTile />), tile)
