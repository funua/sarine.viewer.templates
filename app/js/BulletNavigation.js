(function (window, classie) {
  'use strict';

  function BulletNavigation(args) {
    args = args || {};

    var bullets = Array.prototype.slice.call(args.bulletsContainer.querySelectorAll(args.bulletClassName), 0),
        activeBulletIndex = 0,
        slider = args.slider,
        activeClassName = args.activeBulletClassName || '';

    bullets.forEach(function (element) {
      element.addEventListener('click', function () {
        slider.goTo( parseInt(element.getAttribute('data-target')) );
      });
    });

    if (activeClassName) {
      slider.on('change', function (e) {
        classie.remove(bullets[activeBulletIndex], activeClassName);
        activeBulletIndex = e.detail.currentItemIndex;
        classie.add(bullets[activeBulletIndex], activeClassName);
      });
    }
  }

  window.BulletNavigation = BulletNavigation;
})(window, window.classie);