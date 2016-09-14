(function () {
    /**
     * Get the current URL.
     *
     * @param {function(string)} callback - called when the URL of the 
        current tab
     *   is found.
     */
    function getCurrentTabUrl(callback) {
      // Query filter to be passed to chrome.tabs.query - see
      // https://developer.chrome.com/extensions/tabs#method-query
      var queryInfo = {
        active: true,
        currentWindow: true
      };

      chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
      });
    }

    function saveUsername(username) {
        window.localStorage['username'] = username;
    }

    function getUsername() {
        return window.localStorage['username'];
    }

    function saveLink() {
        getCurrentTabUrl(function (link) {
            console.log('The link to be saved', link);
            document.querySelector('#status').innerHTML = '<h3>Your link was saved</h3>';
        })
    }

    var Storage = {
        add: (key, val) => window.localStorage[key] = val,
        get: (key) => window.localStorage[key],
        remove: (key) => window.localStorage[key] = ''
    }

    var DOM = {
        hide: (domElement) => {
            domElement.style.display = "none";
        },
        show: (domElement) => {
            domElement.style.display = "block";
        },
        setUpToggle: (elements) => {
            elements.forEach(
                (e) => {
                    e.trigger
                        .addEventListener('click', () => {
                            DOM.show(e.show);
                            DOM.hide(e.hide)
                        })
                }
            );
        }
    };

    var Ext = {
        showAuth: () => {
            var signUpForm = document.querySelector('#signup'),
                loginForm = document.querySelector('#login');

            var signUpToggle = document.querySelector('#show-login'),
                loginToggle = document.querySelector('#show-signup');

            var saveConsole = document.querySelector("#save-link");

            var logOut = document.querySelector('#logout');


            DOM.hide(saveConsole);
            DOM.show(loginForm);
            DOM.hide(signUpForm);
            DOM.hide(logOut);
            DOM.setUpToggle([
                    {
                        trigger: signUpToggle,
                        show: loginForm,
                        hide: signUpForm
                    },
                    {
                        trigger: loginToggle,
                        show: signUpForm,
                        hide: loginForm
                    }
                ]);


        },
        removeAuth: () => {
            var signUpForm = document.querySelector('#signup'),
                loginForm = document.querySelector('#login');

            DOM.hide(signUpForm);
            DOM.hide(loginForm);
        },
        setUpLogout: () => {
            var logOut = document.querySelector('#logout');
            logOut.addEventListener('click', () => {
                        Storage.remove('username');
                        Ext.showAuth();
                    })
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var username = getUsername();

        if (username) {
            saveLink();
            Ext.setUpLogout();
            Ext.removeAuth();
        } else {
           Ext.showAuth();
        }
    });


    document.querySelector('#save-link')
        .addEventListener('click', function () {
            var username = document.querySelector('#username').value;
            saveUsername(username);
            saveLink();
        })
})();
