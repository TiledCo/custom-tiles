const api = window.tiledAPI;

const p = (px) => {
  const scale = 1
  return `${(scale * (100 * px / window.innnerWidth)).toFixed(3)}em`;
}

const TextAnim =
`@keyframes Text--fade{
  0% {opacity: 0}
  100% {opacity: 1}
}`

const stylesheet = document.styleSheets[0]
stylesheet.insertRule(TextAnim, stylesheet.cssRules.length);

const mapAlt = (arr, fn1, fn2) => {
  let fn = fn1;
  const output = [];
  arr.forEach(item => {
    output.push(fn.call(null, item));
    fn = fn === fn1 ? fn2 : fn1;
  });
  return output;
}

const addUrlArgs = () => {
  let url = api.props.remoteDataURL;
  const email = api.props.$recipient && api.props.$recipient.email;
  if (url && email) {
    // already has query string
    if (url.indexOf('?') > -1) {
      url += '&recipientEmail=' + encodeURIComponent(email);
    }
    // no query string
    else {
      url += '?recipientEmail=' + encodeURIComponent(email);
    }
  }
  getRemoteData(url);
}

const changeText = (parts, remoteData) => {
  parts = mapAlt(parts, x => x, x => {
    x = x.split(/{{|}}/g)[1].trim();
    let data = remoteData;
    x.split('.').forEach(acc => { data = data[acc] });
    return data;
  });

  const children = mapAlt(parts,
    x => `<span>${x}</span>`,
    x => `<span style='animation: Text--fade 0.2s ease-in;'>${x}</span>`
  );

  document.getElementById('custom-text').innerHTML = children.join('');
}

const getRemoteData = (url) => {
  if (url && api.props.$static !== 'always') {
    const xhr = new XMLHttpRequest();

    xhr.responseType = 'json';
    const callback = changeText;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const parts = mapAlt(api.props.text.split(/\{\{|\}\}/g), x => x, x => '{{' + x + '}}');
        callback(parts, xhr.response);
      }
    }

    xhr.open('GET', url);
    xhr.send();
  }
}

// set style
const style = {
  display: 'block',
  height: '100%',
  width: '100%',
  background: 'none',
  whiteSpace: 'nowrap',
  fontFamily: api.props.fontFamily,
  fontSize: p(api.props.fontSize),
  fontWeight: api.props.fontWeight,
  color: api.props.color,
  textAlign: api.props.textAlign,
}
const element = document.getElementById('tile');
Object.assign(element.style, style);

// write default text
element.innerHTML += `<link href='${'https://fonts.googleapis.com/css?family=' + api.props.fontFamily.replace(/ /g, '+')}' rel='stylesheet' />`
element.innerHTML += `<div id='custom-text'>${api.props.defaultText}</div>`;

// if remote data, call url and replace text
addUrlArgs();
