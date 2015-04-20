javascript: (function() {
  window.u2Config = function() {
    return {
      showHighlights: true
    };
  };
  var d = document,
    s = d.createElement('script');
  s.setAttribute('src', 'https://hypothes.is/app/core.js');  
  d.body.appendChild(s)
})();