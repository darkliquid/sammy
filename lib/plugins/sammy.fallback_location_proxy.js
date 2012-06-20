(function($) {

  Sammy = Sammy || {};

  /*
  # FallbackLocation Proxy

  The Fallback location proxy is a hybrid of the DefaultLocationProxy
  and the PathLocationProxy. It uses hashes to process the path if
  present, otherwise it falls back to the path information. When
  generating locations, it always uses hashes. This is basically a
  way to workaround older browsers without push state support so they
  can benefit from being able to be linked to via pushstate-style 'real'
  URL links, but still work when actually being used with history
  support via hashes.
  */

  Sammy.FallbackLocationProxy = function(app, run_interval_every) {
    this.app = app;
    // set is native to false and start the poller immediately
    this.is_native = false;
    this._startPolling(run_interval_every);
  };

  Sammy.FallbackLocationProxy.fullPath = function(location_obj) {
    // Bypass the `window.location.hash` attribute.  If a question mark
    // appears in the hash IE6 will strip it and all of the following
    // characters from `window.location.hash`.
    var matches = location_obj.toString().match(/^[^#]*(#.+)$/);
    var hash = matches ? matches[1] : '';
    return [location_obj.pathname, location_obj.search, hash].join('');
  };
  $.extend(Sammy.FallbackLocationProxy.prototype, {
    // bind the proxy events to the current app.
    bind: function() {
      var proxy = this, app = this.app, lp = Sammy.FallbackLocationProxy;
      $(window).bind('hashchange.' + this.app.eventNamespace(), function(e, non_native) {
        // if we receive a native hash change event, set the proxy accordingly
        // and stop polling
        if (proxy.is_native === false && !non_native) {
          proxy.is_native = true;
          window.clearInterval(lp._interval);
        }
        app.trigger('location-changed');
      });
      
      if (!lp._bindings) {
        lp._bindings = 0;
      }
      lp._bindings++;
    },

    // unbind the proxy events from the current app
    unbind: function() {
      $(window).unbind('hashchange.' + this.app.eventNamespace());
      //$('a').unbind('click');
      Sammy.FallbackLocationProxy._bindings--;
      if (Sammy.FallbackLocationProxy._bindings <= 0) {
        window.clearInterval(Sammy.FallbackLocationProxy._interval);
      }
    },

    // get the current location from the hash.
    getLocation: function() {
      return Sammy.FallbackLocationProxy.fullPath(window.location);
    },

    // set the current location to `new_location`
    setLocation: function(new_location) {
      if (/^([^#\/]|$)/.test(new_location)) { // non-prefixed url
        new_location = '#!/' + new_location;
      }
      if (new_location != this.getLocation()) {
        return (window.location = new_location);
      }
    },

    _startPolling: function(every) {
      // set up interval
      var proxy = this;
      if (!Sammy.FallbackLocationProxy._interval) {
        if (!every) { every = 10; }
        var hashCheck = function() {
          var current_location = proxy.getLocation();
          if (typeof Sammy.FallbackLocationProxy._last_location == 'undefined' ||
            current_location != Sammy.FallbackLocationProxy._last_location) {
            window.setTimeout(function() {
              $(window).trigger('hashchange', [true]);
            }, 0);
          }
          Sammy.FallbackLocationProxy._last_location = current_location;
        };
        hashCheck();
        Sammy.FallbackLocationProxy._interval = window.setInterval(hashCheck, every);
      }
    }
  });

})(jQuery);