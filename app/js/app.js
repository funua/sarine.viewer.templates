(function (window, document, $, FastClick, classie, Hammer, WallopSlider, PopupService, BulletNavigation, videoPlay) {
    $(function () {
        'use strict';

        var slider,
            storylineNav,
            summaryNav,
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
            totalViewers = 1,
            playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-video-id]'), 0),
            canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'), 0),
            swipeRecognizer = new Hammer(document.getElementById('slider'));


        readConfig();


        slider = new WallopSlider(document.querySelector('.slider'), {
            btnPreviousClass: 'slider__btn--previous',
            btnNextClass: 'slider__btn--next',
            itemClass: 'slide',
            currentItemClass: 'slide--current',
            showPreviousClass: 'slide--show-previous',
            showNextClass: 'slide--show-next',
            hidePreviousClass: 'slide--hide-previous',
            hideNextClass: 'slide--hide-next'
        });
        storylineNav = new BulletNavigation({
            slider: slider,
            bulletsContainer: document.querySelector('.storyline'),
            bulletClassName: '.storyline__item',
            activeBulletClassName: 'storyline__item--active'
        });
        if ($('.summary__story-wrap').length) {
            summaryNav = new BulletNavigation({
                slider: slider,
                bulletsContainer: document.querySelector('.summary__story-wrap'),
                bulletClassName: '.summary__story',
                startFrom: 1
            });
        }


        FastClick.attach(document.body);

        slider.on('change', function (e) {
            var header = e.detail.parentSelector.querySelector('.slider__header'),
                container = $(e.detail.parentSelector);
            
            container.attr('class', 'slider');
            if (e.detail.currentItemIndex === 0) {
                if (!!window.widgetConfig.pages[0].enableStoryline) {
                    classie.remove(header, 'slider__header--hide');
                    classie.add(header, 'slider__header--show');
                } else {
                    classie.add(header, 'slider__header--hide');
                    classie.remove(header, 'slider__header--show');
                }
                container.addClass('slider--summary');
            } else {
                classie.remove(header, 'slider__header--hide');
                classie.add(header, 'slider__header--show');
            }
            
            container.addClass('slider--' + container.find('ul.slider__list > .slide').eq(e.detail.currentItemIndex).attr('data-slidename'));
        });

        canvases.forEach(function (element) {
            if (classie.has(element, 'no_stone')) {
                totalViewers--;
            }
        });

        if (totalViewers > 0) {
            $(document).on("full_init_end", function (event, data) {
                console.log('full_init_end data ->', data);
                totalViewers--;
                if (totalViewers <= 0) {
                    onViewersReady();
                }
            });
        } else {
            onViewersReady();
        }

        swipeRecognizer.on('swipeleft swiperight', function (e) {
            if (e.type === 'swipeleft') {
                slider.next();
            } else {
                slider.previous();
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

            if (name && totalGradeScales && totalGrade) {
                totalGradeScales.some(function (item) {
                    if (item.name === name) {
                        displayVal = item['default-display'];
                        totalGrade.innerHTML = displayVal.split(' ')[0];
                        totalGradeStars.innerHTML = new Array(parseInt(displayVal[displayVal.length - 1]) + 1).join('★');
                        return true;
                    }
                    return false;
                });
            }
        }

        function onViewersReady() {
            sarineInfos.forEach(function (element) {
                var field = element.getAttribute('data-sarine-info'),
                        value = recurse(stone, field.split('.'));

                if (value === (void 0) || value === null) {
                    element.parentNode.style.display = 'none';
                    console.log('element.parentNode ->', element.parentNode);
                } else if (field === 'stoneProperties.carat') {
                    element.innerHTML = parseFloat(value).toFixed(3);
                }
            });

            document.querySelector('.slider').style.display = '';
            document.querySelector('.preloader').style.display = 'none';
        }
    });
  
  
  
    // Read config
    function readConfig() {
        var wConfig = window.widgetConfig,
            elements = {
                storylineContainer: $('ul.storyline'),
                sliderPagesContainer: $('ul.slider__list'),
                summaryLinksContainer: $('ul.summary__stories'),
                tmpSlidesContainer: $('<div/>').appendTo($('body')),
                customerLogo: $('.footer__customer__logo'),
                sliderWrap: $('.slider-wrap'),
                sliderHeader: $('.slider__header')
            };
        
        function iterateConfigPages(iterator) {
            var i;
            if (typeof iterator !== 'function') return;
            
            for (i = 0; i < wConfig.pages.length; i++) {
                iterator(wConfig.pages[i]);
            }
        }
        
        
        // Substitute fields from config
        $('[data-widgetconfig-value]').each(function (i, elem) {
            var value = $(elem).attr('data-widgetconfig-value');
            if (wConfig[value]) {
                $(elem).html(wConfig[value]);
            }
        });


        // Add storyline items
        if ($.isArray(wConfig.pages)) {
            iterateConfigPages(function (page) {
                $('<li />', {
                    class: 'storyline__item'
                }).html(page.title).appendTo(elements.storylineContainer);
            });
        }
        elements.storylineContainer.addClass('items-count-' + wConfig.pages.length);

        // Enable slides
        elements.tmpSlidesContainer.append(elements.sliderPagesContainer.find('> .slide'));
        iterateConfigPages(function (page) {
            var slide = elements.tmpSlidesContainer.find('> .slide.slide--' + page.code)
                    .attr('data-slidename', page.code)
                    .appendTo(elements.sliderPagesContainer);
            if (page.controls3d) {
                slide.addClass(page.controls3d);
            }
        });
        elements.tmpSlidesContainer.remove();
        
        
        // Add slides links for summary page
        if (wConfig.pages[0].disableNavigation) {
            elements.summaryLinksContainer.remove();
        } else {
            iterateConfigPages(function (page) {
                if (page.code === 'summary') return;

                $('<li/>', {
                    class: 'summary__story summary__story--' + page.code
                }).html(page.title).appendTo(elements.summaryLinksContainer);
            });
        }
        
        
        // Show / hide customer logo
        if (!!wConfig.customer_logo) {
            wConfig.customer_logo.href && elements.customerLogo.attr('href', wConfig.customer_logo.href);
            wConfig.customer_logo.img && elements.customerLogo.find('img').attr('src', wConfig.customer_logo.img);
            if (wConfig.customer_logo.title) {
                elements.customerLogo.attr('title', wConfig.customer_logo.title);
                elements.customerLogo.find('img').attr('alt', wConfig.customer_logo.title);
            }
        } else {
            elements.customerLogo.remove();
        }
        
        
        // Add color scheme class
        wConfig.color_scheme && elements.sliderWrap.addClass(wConfig.color_scheme);
        
        
        if (!!wConfig.pages[0].enableStoryline) {
            elements.sliderHeader.show();
        }
    }
})(window, window.document, window.jQuery, window.FastClick, window.classie, window.Hammer, window.WallopSlider, window.PopupService, window.BulletNavigation, window.videoPlay);
