(function (window, document, $, FastClick, classie, Hammer, WallopSlider, PopupService, BulletNavigation, videoPlay) {
  $(function () {
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
        closePopupTriggers = Array.prototype.slice.call(document.querySelectorAll('.popup__close-btn'), 0),
        sarineInfos = Array.prototype.slice.call(document.querySelectorAll('[data-sarine-info]'), 0),
        lightGrades = Array.prototype.slice.call(document.querySelectorAll('[data-light-grade]'), 0),
        stone = window.stones && window.stones[0],
        lightGradesMap = {
          1: 'minimum',
          2: 'standard',
          3: 'high',
          4: 'very-high',
          5: 'exceptional'
        },
        totalViewers = 4,
        playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-video-id]'), 0),
        swipeRecognizer = new Hammer(document.getElementById('slider_wrap'));

    FastClick.attach(document.body);

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

    $(document).on("full_init_end", function(event, data) {
      console.log(data);
      totalViewers--;
      if (totalViewers <= 0) {
        document.querySelector('.slider').style.display = '';
        document.querySelector('.preloader').style.display = 'none';
      }
    });

    swipeRecognizer.on('swipeleft swiperight', function (e) {
      if (e.type === 'swipeleft') {
        slider.next();
      } else {
        slider.previous();
      }
    });

    sarineInfos.forEach(function (element) {
      var field = element.getAttribute('data-sarine-info'),
          value = recurse(stone, field.split('.'));

      if (value === (void 0) || value === null) {
        element.parentNode.style.display = 'none';
      }
    });

    setTotalGrade();

    lightGrades.forEach(function (element) {
      var grade = stone && stone.lightGrades && stone.lightGrades[element.getAttribute('data-light-grade')],
          value = grade && grade.value;

      /*if (value) {
        classie.add(element, 'specs__points--value-' + Math.ceil(7 * value / 5));
      }*/

      if (value && lightGradesMap[value]) {
        classie.add(element, 'specs__points--' + lightGradesMap[value]);
      }
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

    playTriggers.forEach(function (element) {
      videoPlay.initButton(element);
    });



    function recurse(o, props) {
      if (props.length === 0) {
        return o;
      }

      if (!o) {
        return void 0;
      }

      return recurse(o[props.shift()], props);
    }

    function setTotalGrade() {
      var name = stone && stone.lightGrades && stone.lightGrades.totalGrade && stone.lightGrades.totalGrade.name,
          gradeScales = window.gradeScales || {},
          totalGradeScales = gradeScales.totalGrade,
          totalGrade = document.querySelector('[data-total-grade]'),
          totalGradeStars = document.querySelector('[data-total-grade-stars]'),
          displayVal;

      if (name && totalGradeScales) {
        totalGradeScales.some(function (item) {
          if (item.value === name || item.name === name) {
            displayVal = item['default-display'];
            totalGrade.innerHTML = displayVal.split(' ')[0];
            totalGradeStars.innerHTML = new Array(parseInt(displayVal[displayVal.length - 1]) + 1).join('★');
            return true;
          }
          return false;
        });
      }
    }
  });
})(window, window.document, window.jQuery, window.FastClick, window.classie, window.Hammer, window.WallopSlider, window.PopupService, window.BulletNavigation, window.videoPlay);