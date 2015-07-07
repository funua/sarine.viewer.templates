
/*
Generated from CoffeeScript source
 */

(function() {
  $(function() {
    var getPath, onViewersReady, processTemplate, totalViewers;
    onViewersReady = function () {
        var url;
        url = getPath(template) + '/config.json';
//        url = 'http://sarine-widgets.synergetica.net/config.json';   // test server
        return $.getJSON(url).done(function (response) {
            if (typeof response === 'object' && response.pages && response.pages.length) {
                return processTemplate(response);
            }
        }).always(function () {
            $('.loading').hide();
            return $('.container').show();
        });
    };
    getPath = function(src) {
      var arr;
      arr = src.split('/');
      arr.pop();
      return arr.join('/');
    };

    /*  Prepare to catch viewers ready state */
    totalViewers = $('.viewer').length;
    $('canvas').each(function(aCanvas) {
      if ($(aCanvas).hasClass('no_stone')) {
        return totalViewers--;
      }
    });
    if (totalViewers) {
      $(document).on('first_init_end', function() {
        totalViewers--;
        if (totalViewers <= 0) {
          return onViewersReady();
        }
      });
    } else {
      onViewersReady();
    }
    return processTemplate = function(dynamicConfig) {
      var aPage, i, len, ref, tmpContainer, viewersContainer;
      viewersContainer = $('.all-viewers');
      tmpContainer = $('<div/>');
      viewersContainer.find('> .viewer-container').appendTo(tmpContainer);
      ref = dynamicConfig.pages;
      for (i = 0, len = ref.length; i < len; i++) {
        aPage = ref[i];
        tmpContainer.find('> .' + aPage.viewer).appendTo(viewersContainer);
      }
      return 18;
    };
  });

}).call(this);
