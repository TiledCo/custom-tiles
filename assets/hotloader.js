var lastLoadTime = Date.now()
setInterval(function() {
  fetch('/loadtime')
  .then(data => data.json())
  .then(function(data) {
    if (data.time > lastLoadTime) {
      console.log('reloading')
      window.location.href = window.location.href
    }
  });
}, 2000);
