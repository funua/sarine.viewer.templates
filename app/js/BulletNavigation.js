(function (window, classie) {
  'use strict';

  function BulletNavigation(args) {
    args = args || {};

    var bullets = Array.prototype.slice.call(args.bulletsContainer.querySelectorAll(args.bulletClassName), 0),
        activeBulletIndex = 0,
        slider = args.slider,
        activeClassName = args.activeBulletClassName || '',
        startFrom = args.startFrom || 0;

    bullets.forEach(function (element, index) {
      element.addEventListener('click', function (e) {
        slider.goTo(index + startFrom);
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