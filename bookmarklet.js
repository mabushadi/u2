javascript: (function() {
  window.u2Config = function() {
    return {
      showHighlights: true
    };
  };
  var d = document,
    s = d.createElement('script');
  s.setAttribute('src', 'https://raw.githubusercontent.com/mabushadi/u2/master/core.js');  
  d.body.appendChild(s)
})();