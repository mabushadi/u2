(function() {
    // Injects the u2 dependencies. These can be either js or css, the
    // file extension is used to determine the loading method. This file is
    // pre-processed in order to insert the wgxpath, url and inject scripts.
    //
    // Custom injectors can be provided to load the scripts into a different
    // environment. Both script and stylesheet methods are provided with a url
    // and a callback fn that expects either an error object or null as the only
    // argument.
    //
    // For example a Chrome extension may look something like:
    //
    //   window.u2Install({
    //     script: function (src, fn) {
    //       chrome.tabs.executeScript(tab.id, {file: src}, fn);
    //     },
    //     stylesheet: function (href, fn) {
    //       chrome.tabs.insertCSS(tab.id, {file: href}, fn);
    //     }
    //   });
    window.u2Install = function(inject) {
        inject = inject || {};

        var resources = [];
        var injectStylesheet = inject.stylesheet || function injectStylesheet(href, fn) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = href;

                document.head.appendChild(link);
                fn(null);
            };

        var injectScript = inject.script || function injectScript(src, fn) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.onload = function() {
                    fn(null)
                };
                script.onerror = function() {
                    fn(new Error('Failed to load script: ' + src))
                };
                script.src = src;

                document.head.appendChild(script);
            };

        var getSelectionText = function() {
            var text = "";
            if(window.getSelection) {
                text = window.getSelection().toString();
            } else if(document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().html;
            }
            return text;
        }

        function getSelectionHTML() {
            var range;
            if(document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                return range.htmlText;
            }
            else if(window.getSelection) {
                var selection = window.getSelection();
                if(selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                    var clonedSelection = range.cloneContents();
                    var div = document.createElement('div');
                    div.appendChild(clonedSelection);
                    return div.innerHTML;
                }
                else {
                    return '';
                }
            }
            else {
                return '';
            }
        }

        function findElementByText(text){
            var jSpot=$(":contains("+text+")")
                .filter(function(){ return $(this).children().length === 0;})
                .parent();  // because you asked the parent of that element

            return jSpot;
        }

        function bindNotes(){
            $.ajax({
                url: domain + '/getnotes',
                dataType: 'jsonp',
                success: function(res) {
                    $.each(res, function(i, item){
                        var elem = findElementByText(item.title);
                        if(elem.length > 0){
                            console.log(elem);
                        }
                    });
                }
            });
        }

        function renderSidebar(){
            var notesUrl = domain + "/" + username + "/notes";
            var sidebar = $('body').append('' +
            '<div class="form-group u2-sidebar">' +
            '<button type="button" class="u2-close close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4><a href="' + notesUrl + '" target="_blank">Ulti Notes</a></h4>' +
            '<button class="btn btn-primary btn-sm u2-snip">Snip selection</button>' +
            '<br><br>' +
            '<input class="form-control u2-title" placeholder="Title"/> ' +
            '<input class="form-control u2-url" placeholder="URL"/> ' +
            '<input class="form-control u2-username" placeholder="Username"/> ' +
            '<div class="u2-preview"></div>' +
            '<textarea class="form-control u2-comments" placeholder="Enter comments"></textarea> ' +
            '<br>' +
            '<button class="btn btn-primary u2-save">Save</button>' +
            '<button class="btn btn-default u2-close">Close</button>' +
            '</div>');
            sidebar.find('button.u2-snip').on('click', function() {
                var selectedText = getSelectionText();
                var selectedHTML = getSelectionHTML();
                $('.u2-sidebar').find('.u2-preview').html(selectedHTML);
                $('.u2-title').val(selectedText.substring(0, 30));
                $('.u2-url').val(window.location.href);
                $('.u2-username').val(username);
            });
            sidebar.find('button.u2-close').on('click', function() {
                $('.u2-sidebar').remove();
            });
            sidebar.find('button.u2-save').on('click', function() {
                $.ajax({
                    url: domain + '/savenotes',
                    dataType: 'jsonp',
                    data: {
                        username : $('.u2-username').val(),
                        title : $('.u2-title').val(),
                        url : $('.u2-url').val(),
                        comments : $('.u2-comments').val(),
                        content : $('.u2-preview').html()
                    },
                    success: function(res) {
                        $('.u2-sidebar').hide();
                    }
                });
            });
        }


        if(!window.document.evaluate) {
            resources = resources.concat(['https://hypothes.is/assets/scripts/vendor/polyfills/wgxpath.install.min.js?bab1c82f']);
        }

        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/url/parser.js
        var url, urlWorks;
        try {
            // have to actually try use it, because Safari defines a dud constructor
            url = new URL('http://modernizr.com/');
            urlWorks = url.href === 'http://modernizr.com/';
        }
        catch(err) {
            urlWorks = false;
        }
        if(!urlWorks) {
            resources = resources.concat(['https://hypothes.is/assets/scripts/vendor/polyfills/url.min.js?de686538']);
        }

        var domain = window.location.href.indexOf('https://') >= 0 ? 'https://localhost' : 'http://localhost:3000';
        var username  = "mabushadi";
        if(typeof window.Annotator === 'undefined') {
            resources = resources.concat([
                '//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js',
                domain + '/bookmarklet/u2.css']);
        }

        (function next(err) {
            if(err) {
                throw err;
            }

            if(resources.length) {
                var url = resources.shift();
                var ext = url.split('?')[0].split('.').pop();
                var fn = (ext === 'css' ? injectStylesheet : injectScript);
                fn(url, next);
            } else {
                console.log('Finished loading u2...');
                renderSidebar();
                bindNotes();
            }
        })();
    }

    window.u2Install();
})();