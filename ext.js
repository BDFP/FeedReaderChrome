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
            document.querySelector('#status').innerHTML =
                `<h3>Your link was  saved</h3>`;
        })
    }

    var BASE_URL = "http://localhost:8080/";

    var AuthService = {
        login: (user) => {
            axios.post(BASE_URL + 'api/login', user)
                .then((response) => {
                    console.log(response);
                    DOM.showProgress(false);
                    Ext.showConsole();
                })
                .catch((reason) => {
                    console.log(reason);
                    DOM.showProgress(false);
                    Ext.showError(reason);
                })
        },
        signup: (user) => {
            console.log('Sign up called');
            axios.post(BASE_URL + 'api/signup', user)
                .then((response) => {
                    console.log(response);
                    DOM.showProgress(false);
                    Ext.showConsole();
                })
                .catch((reason) => {
                    console.log(reason);
                    DOM.showProgress(false);
                    Ext.showError(reason);
                })
        }
    };

    var Storage = {
        add: (key, val) => window.localStorage[key] = val,
        get: (key) => window.localStorage[key],
        remove: (key) => window.localStorage[key] = ''
    };

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
        },
        showProgress: (show) => {
            var progress = document.querySelector('.loader8');
            if (show) { 
                DOM.show(progress);
            } else {
                DOM.hide(progress);
            }
        }
    };

    var Ext = function() {};

    Ext.init = function() {
        this.signUpForm = document.querySelector('#signup');
        this.loginForm = document.querySelector('#login');

        this.signUpToggle = document.querySelector('#show-login');
        this.loginToggle = document.querySelector('#show-signup');

        this.saveConsole = document.querySelector("#save-link");

        this.logOut = document.querySelector('#logout');

        this.loginUsername = document.querySelector('#login-username');
        this.loginPassword = document.querySelector('#login-password');

        this.signupUsername = document.querySelector('#signup-username');
        this.signupPassword = document.querySelector('#signup-password');
    };

    Ext.showAuth = function() {
        DOM.hide(this.saveConsole);
        DOM.show(this.loginForm);
        DOM.hide(this.signUpForm);
        DOM.hide(this.logOut);
        DOM.setUpToggle([
                {
                    trigger: this.signUpToggle,
                    show: this.loginForm,
                    hide: this.signUpForm
                },
                {
                    trigger: this.loginToggle,
                    show: this.signUpForm,
                    hide: this.loginForm
                }
            ]);
        DOM.showProgress(false);

        document.querySelector('#signup-button')
            .addEventListener('click', (event) => {
                event.preventDefault();
                DOM.showProgress(true);
                AuthService.signup(Ext.getUserDetails(false))
            });

        document.querySelector('#login-button')
            .addEventListener('click', (event) => {
                event.preventDefault();
                DOM.showProgress(true);
                AuthService.login(Ext.getUserDetails(true))
            });
    };
    
    Ext.removeAuth = function () {
        var signUpForm = document.querySelector('#signup'),
            loginForm = document.querySelector('#login');

        DOM.hide(signUpForm);
        DOM.hide(loginForm);
    };
    
    Ext.showConsole = function() {
        DOM.show(this.saveConsole);
        DOM.hide(this.loginForm);
        DOM.hide(this.signUpForm);
        DOM.show(this.logOut);
        Ext.setUpLogout();
    };
    
    Ext.setUpLogout = function() {
        var logOut = document.querySelector('#logout');
        logOut.addEventListener('click', () => {
                    Storage.remove('username');
                    Ext.showAuth();
                })
    };
    
    Ext.getUserDetails = function(isLogin) {
        if (isLogin) {
            return {
                username: this.loginUsername.value,
                password: this.loginPassword.value
            }
        } else {
            return {
                username: this.signupUsername.value,
                password: this.signupPassword.value
            }
        }
    };
    
    Ext.showError = function(reason) {
        var msg = document.querySelector('.msg');
        msg.textContent = reason;
    };

    document.addEventListener('DOMContentLoaded', function () {
        var username = getUsername();
        Ext.init();

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
