(function (window, classie) {
  'use strict';

  function PopupService(args) {
    args = args || {};

    this._overlay = args.overlay;
    this._openClassName = args.openClassName || 'popup-wrap--open';
    this._closeClassName = args.closeClassName || 'popup-wrap--close';
    this._openOverlayClassName = args.openOverlayClassName || 'popup-overlay--open';
  }

  PopupService.prototype.open = function (element) {
    var currentElement = this.currentElement;

    if (currentElement === element) {
      return;
    }

    if (currentElement) {
      this.close(currentElement);
    }

    this.currentElement = element;
    classie.add(this._overlay, this._openOverlayClassName);
    classie.remove(element, this._closeClassName);
    classie.add(element, this._openClassName);
  };

  PopupService.prototype.close = function (element) {
    this.currentElement = null;
    classie.remove(this._overlay, this._openOverlayClassName);
    classie.remove(element, this._openClassName);
    classie.add(element, this._closeClassName);
  };

  window.PopupService = PopupService;
})(window, window.classie);