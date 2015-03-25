(function (window, document, FastClick, classie, imagesLoaded, WallopSlider, PopupService, BulletNavigation) {
  'use strict';

  var slider = new WallopSlider(document.querySelector('.slider'), {
        btnPreviousClass: 'slider__btn--previous',
        btnNextClass: 'slider__btn--next',
        itemClass: 'slide',
        currentItemClass: 'slide--current',
        showPreviousClass: 'slide--show-previous',
        showNextClass: 'slide--show-next',
        hidePreviousClass: 'slide--hide-previous',
        hideNextClass: 'slide--hide-next'
      }),
      storylineNav = new BulletNavigation({
        slider: slider,
        bulletsContainer: document.querySelector('.storyline'),
        bulletClassName: '.storyline__item',
        activeBulletClassName: 'storyline__item--active'
      }),
      summaryNav = new BulletNavigation({
        slider: slider,
        bulletsContainer: document.querySelector('.summary__story-wrap'),
        bulletClassName: '.summary__story',
        startFrom: 1
      }),
      popupService = new PopupService({
        overlay: document.getElementById('popup_overlay')
      }),
      openPopupTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-popup-id]'), 0),
      closePopupTriggers = Array.prototype.slice.call(document.querySelectorAll('.popup__close-btn'), 0);

  document.addEventListener('DOMContentLoaded', function () {
    FastClick.attach(document.body);
  }, false);

  slider.on('change', function (e) {
    var header = e.detail.parentSelector.querySelector('.slider__header');

    if (e.detail.currentItemIndex === 0) {
      classie.add(header, 'slider__header--hide');
      classie.remove(header, 'slider__header--show');
      classie.add(e.detail.parentSelector, 'slider--summary');
    } else {
      classie.remove(header, 'slider__header--hide');
      classie.add(header, 'slider__header--show');
      classie.remove(e.detail.parentSelector, 'slider--summary');
    }

    if (e.detail.currentItemIndex === 2) {
      classie.add(e.detail.parentSelector, 'slider--loupe');
    } else {
      classie.remove(e.detail.parentSelector, 'slider--loupe');
    }
  });

  imagesLoaded('.slider-wrap', function (e) {
    document.querySelector('.slider').removeAttribute('data-hidden');
    document.querySelector('.preloader').setAttribute('data-hidden', true);
  });

  openPopupTriggers.forEach(function (element) {
    var popupWrap = document.getElementById(element.getAttribute('data-popup-id'));

    if (popupWrap) {
      element.addEventListener('click', function () {
        popupService.open(popupWrap);
      });
    }
  });

  closePopupTriggers.forEach(function (element) {
    element.addEventListener('click', function () {
      popupService.close(element.parentNode.parentNode);
    });
  });
})(window, window.document, window.FastClick, window.classie, window.imagesLoaded, window.WallopSlider, window.PopupService, window.BulletNavigation);