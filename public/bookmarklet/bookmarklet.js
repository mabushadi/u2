javascript: (function() {
    window.u2Config = function() {
        return {
            showHighlights: true
        };
    };
    var domain = window.location.href.indexOf('https://') >= 0 ? 'https://localhost' : 'http://localhost:3000';
    var d = document,
        s = d.createElement('script');
    s.setAttribute('src', domain + '/bookmarklet/core.js');
    d.body.appendChild(s)
})();