(function (window, classie, $) {
    'use strict';

    function PopupService(args) {
        args = args || {};

        this._overlay = args.overlay;
        this._openClassName = args.openClassName || 'popup-wrap--open';
        this._closeClassName = args.closeClassName || 'popup-wrap--close';
        this._openOverlayClassName = args.openOverlayClassName || 'popup-overlay--open';
        this._isDashboard = args.isDashboard || false;
    }

    PopupService.prototype.open = function (element) {
        var currentElement;
        
        if (!this._isDashboard) {
            currentElement = this.currentElement;
            
            if (currentElement === element) {
                return;
            }

            if (currentElement) {
                this.close(currentElement);
            }

            this.currentElement = element;
        }
        
        if (!this._isDashboard) {
            classie.add(this._overlay, this._openOverlayClassName);
        }
        
        classie.remove(element, this._closeClassName);
        classie.add(element, this._openClassName);

        $(element).show();
    };

    PopupService.prototype.close = function (element) {
        var videoElement;

        this.currentElement = null;
        if (!this._isDashboard) {
            classie.remove(this._overlay, this._openOverlayClassName);
        }
        
        classie.remove(element, this._openClassName);
        classie.add(element, this._closeClassName);

        videoElement = element.querySelector('video');
        if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
        }

        window.setTimeout(function () {
            // Hide popup after 0.5 s closing animation to free some memory on mobile browsers.
            $(element).hide();
        }, 500);
    };

    window.PopupService = PopupService;
})(window, window.classie, window.jQuery);
