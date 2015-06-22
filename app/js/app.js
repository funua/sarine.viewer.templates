(function (window, document, $, FastClick, classie, Hammer, WallopSlider, PopupService, BulletNavigation, videoPlay) {
    $(function () {
        'use strict';

        var slider,
            storylineNav,
            summaryNav,
            popupService = new PopupService({
                overlay: document.getElementById('popup_overlay')
            }),
            openPopupTriggers,
            closePopupTriggers,
            sarineInfos,
            lightGrades,
            stone = window.stones && window.stones[0],
            lightGradesMap = {
                1: 'minimum',
                2: 'standard',
                3: 'high',
                4: 'very-high',
                5: 'exceptional'
            },
            totalViewers,
            playTriggers,
            canvases,
            swipeRecognizer,
            wConfig = window.widgetConfig;

        
        if ($('.slider__header')[0]) {
            $('.slider__header')[0].setVisibility = function (setVisible) {
                if (setVisible) {
                    classie.remove(this, 'slider__header--hide');
                    classie.add(this, 'slider__header--show');
                } else {
                    classie.add(this, 'slider__header--hide');
                    classie.remove(this, 'slider__header--show');
                }
            };
        }
        
        
        
        function main() {
//            console.log(' == main()');
            
            openPopupTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-popup-id]'), 0);
            closePopupTriggers = Array.prototype.slice.call(document.querySelectorAll('.popup__close-btn'), 0);
            sarineInfos = Array.prototype.slice.call(document.querySelectorAll('[data-sarine-info]'), 0);
            lightGrades = Array.prototype.slice.call(document.querySelectorAll('[data-light-grade]'), 0);
            totalViewers = $('.viewer').length;
            playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-video-id]'), 0);
            canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'), 0);
            
            
            readConfig();
            
//            console.log('Slides count ->', $('.slide').length);
            
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
                    header.setVisibility(wConfig.pages[0].enableStoryline);
                } else {
                    header.setVisibility(true);
                }

                container.addClass('slider--' + container.find('ul.slider__list > .slide').eq(e.detail.currentItemIndex).attr('data-slidename'));
            });

            canvases.forEach(function (element) {
                if (classie.has(element, 'no_stone')) {
                    totalViewers--;
                }
            });

            if (totalViewers > 0) {
                $(document).on("first_init_end", function (event, data) {
//                    console.log('first_init_end ->', data.Id);
                    totalViewers--;
                    if (totalViewers <= 0) {
                        onViewersReady();
                    }
                });
            } else {
                onViewersReady();
            }


            if (Hammer) {
                swipeRecognizer = new Hammer(document.getElementById('slider'));
                swipeRecognizer.on('swipeleft swiperight', function (e) {
                    if (e.type === 'swipeleft') {
                        slider.next();
                    } else {
                        slider.previous();
                    }
                });
            }

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
        }


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
//            console.log(' == onViewersReady()');
            sarineInfos.forEach(function (element) {
                var field = element.getAttribute('data-sarine-info'),
                    value = recurse(stone, field.split('.'));

                if (value === (void 0) || value === null) {
                    element.parentNode.style.display = 'none';
                } else if (field === 'stoneProperties.carat') {
                    element.innerHTML = parseFloat(value).toFixed(3);
                }
            });

            document.querySelector('.slider').style.display = '';
            document.querySelector('.preloader').style.display = 'none';
        }
        
        
        function markPagesForNullViewers() {
//            console.log(' == markPagesForNullViewers()');

            iterateConfigPages(function (page) {
                var currentSlide = $('ul.slider__list').find('.slide--' + page.code),
                    currentViewer = currentSlide.find('.viewer'),
                    currentViewerName = '';
                if (!currentViewer.length) return;

                currentViewerName = currentViewer.attr('class').replace('viewer ', '');

                if (!document.viewersList[currentViewerName]) {
//                    console.log('Skip ', currentViewerName);
                    page.skip = true;
                }
            });
        }
  
    
        function iterateConfigPages(iterator) {
            var i, cpl;
            if (typeof iterator !== 'function') return;

            for (i = 0, cpl = wConfig.pages.length; i < cpl; i++) {
                iterator(wConfig.pages[i]);
            }
        }
    
  
        function readConfig() {
            var elements = {
                    storylineContainer: $('ul.storyline'),
                    sliderPagesContainer: $('ul.slider__list'),
                    summaryLinksContainer: $('ul.summary__stories'),
                    tmpSlidesContainer: $('<div/>'),
                    customerLogo: $('.footer__customer__logo'),
                    sliderWrap: $('.slider-wrap'),
                    sliderHeader: $('.slider__header'),
                    aSlider: $('#slider')
                },
                activeSlidesCount;
                
//            console.log(' == readConfig()');

            // Substitute fields from config
            $('[data-widgetconfig-value]').each(function (i, elem) {
                var value = $(elem).attr('data-widgetconfig-value');
                if (wConfig[value]) {
                    $(elem).html(wConfig[value]);
                }
            });

            elements.tmpSlidesContainer.append(elements.sliderPagesContainer.find('> .slide'));

            // Add storyline items
            if ($.isArray(wConfig.pages)) {
                iterateConfigPages(function (page) {
                    if (page.skip) return;
                    $('<li />', {
                        class: 'storyline__item'
                    }).html(page.title).appendTo(elements.storylineContainer);
                });
            }
            activeSlidesCount = $('.storyline__item').length;
            
                


            // Enable slides
            iterateConfigPages(function (page) {
                var slide;
                if (page.skip) return;
                slide = elements.tmpSlidesContainer.find('> .slide.slide--' + page.code);

                if (page.controls3d) {
                    slide.addClass(page.controls3d);
                }

                slide.attr('data-slidename', page.code)
                    .appendTo(elements.sliderPagesContainer);
            });
            elements.tmpSlidesContainer.remove();
            elements.aSlider.addClass('slider--' + $('.slide:first').attr('data-slidename'));
            $('.slide:first').addClass('slide--current');


            // Add slides links for summary page
            if (wConfig.pages[0].disableNavigation) {
                elements.summaryLinksContainer.remove();
            } else {
                iterateConfigPages(function (page) {
                    if (page.code === 'summary' || page.skip) return;

                    $('<li/>', {
                        class: 'summary__story summary__story--' + page.code
                    }).html(page.title).appendTo(elements.summaryLinksContainer);
                });
            }
            
            
            if (activeSlidesCount > 1) {
                elements.storylineContainer
                        .addClass('items-count-' + activeSlidesCount)
                        .find('> .storyline__item').eq(0).addClass('storyline__item--active');
            } else {
                elements.storylineContainer.add('.slider__btn').hide();
            }


            // Add classes to slider wrap element: color scheme and widget code
            wConfig.color_scheme && elements.sliderWrap.addClass(wConfig.color_scheme);
            wConfig.widget_brief_code && elements.sliderWrap.addClass(wConfig.widget_brief_code);


            if (wConfig.pages[0].enableStoryline) {
                elements.sliderHeader[0].setVisibility(true);
            }
            $('.popup-wrap button').attr('tabindex', '-1');
        }
        
        
        
        if (wConfig.autoDisableSlides) {
            $(document).on('loadTemplate', function () {
                // Finished loading and initializing viewers
                markPagesForNullViewers();
                main();
                onViewersReady();       // In case of some viewers are null
            });
        } else {
            main();
        }
    });
})(window, window.document, window.jQuery, window.FastClick, window.classie, window.Hammer, window.WallopSlider, window.PopupService, window.BulletNavigation, window.videoPlay);




/**
 * Intercept console.log() calls and display their messages in floating element.
 * Add 'catch_log' string to url hash to enable this feature,
 * i.e. 'localhost:9003/#catch_log'.
 * 
 * May also be combined with 'debug' key to show another floating element for displaying viewers loading process.
 * For example:
 * localhost:9003/#debug--catch_log
 * The keys separator may be any valid character(s).
 * 
 * @returns {void}
 */
(function () {
    var consoleLog,
        logSelector = 'console_log',
        oldLog = console.log;
    
    if (window.location.hash.indexOf('catch_log') === -1) return;
    
    consoleLog = $('#' + logSelector);
    if (consoleLog.length === 0) {
        consoleLog = $('<div/>', {id: logSelector})
                .css({
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                    padding: '10px 20px',
                    border: '1px soled #999',
                    background: '#ddd',
                    maxHeight: '300px',
                    maxWidth: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '92%',
                    lineHeight: '130%'
                })
                .appendTo($('body'));
    }
    console.log = function (message) {
        consoleLog.prepend($('<p/>', {text: message}).css({margin: '.7em 0'}));
        oldLog.apply(console, arguments);
    };
})();




/**
 * Profiler.
 * Add 'profiler' to to url hash to enable this feature.
 */
(function (window, document, $) {
    var $resultContainer,
        loaded = false;
    
    if (window.location.hash.indexOf('profiler') === -1) return;
    console.log('Remove sarine-viewers and load empty pages...');
    
    $resultContainer = $('<div/>').css({
        minHeight: '50px',
        textAlign: 'center',
        paddingTop: '15px',
        fontWeight: 'bold',
        fontSize: '150%',
        color: 'red'
    });
    $('sarine-viewer').eq(0).replaceWith($resultContainer);
    $('sarine-viewer').remove();
    
    $(window).load(function () {
        console.log('Finished loading');
        loaded = true;
        onLoad();
    });
    window.setTimeout(function () {
        if (loaded) return;
        loaded = true;
        console.log('Force finished loading');
        onLoad();
    }, 1000);
    
    function onLoad() {
        document.querySelector('.slider').style.display = '';
        document.querySelector('.preloader').style.display = 'none';
        $resultContainer.html('Loaded');
    }
})(window, window.document, window.jQuery);
