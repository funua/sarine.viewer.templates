(function (window, document, $, FastClick, classie, PopupService, videoPlay, jss) {
    $(function () {
        'use strict';

        var popupService = new PopupService({
                overlay: null,
                isDashboard: true
            }),
            openPopupTriggers,
//            closePopupTriggers,
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
            dText = window.dynamicText,
            wConfig = window.widgetConfig;
        
        
        function main() {
            readConfig();
            setStyles();
            setTexts();
            
            openPopupTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-popup-id]'), 0);
//            closePopupTriggers = Array.prototype.slice.call(document.querySelectorAll('.popup__close-btn'), 0);
            sarineInfos = Array.prototype.slice.call(document.querySelectorAll('[pages]'), 0);
            lightGrades = Array.prototype.slice.call(document.querySelectorAll('[data-light-grade]'), 0);
            totalViewers = $('.viewer').length;
            playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-video-id]'), 0);
            canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'), 0);

            FastClick.attach(document.body);

            canvases.forEach(function (element) {
                if (classie.has(element, 'no_stone')) {
                    totalViewers--;
                }
            });

            if (totalViewers > 0) {
                $(document).on('first_init_end', function (event, data) {
                    totalViewers--;
                    if (totalViewers <= 0) {
                        onViewersReady();
                    }
                });
            } else {
                onViewersReady();
            }

            setTotalGrade();

            lightGrades.forEach(function (element) {
                var grade = stone && stone.lightGrades && stone.lightGrades[element.getAttribute('data-light-grade')],
                        value = grade && grade.value;

                if (value && lightGradesMap[value]) {
                    classie.add(element, 'specs__points--' + lightGradesMap[value]);
                }
            });

            openPopupTriggers.forEach(function (element) {
                var popupWrap = document.getElementById(element.getAttribute('data-popup-id'));

                if (popupWrap) {
                    element.addEventListener('click', function () {
                        var popupContainer = $(this).closest('.slide').find('.popup-container').show(),
                            currentPopup;
                        $('<div class="popup-overlay popup-overlay--open"/>').appendTo(popupContainer);
                        currentPopup = $(popupWrap)
                                .clone()
                                .appendTo(popupContainer)
                                .attr('id', $(popupWrap).attr('id') + '_copy');
                        popupService.open(currentPopup[0]);
                        
                        currentPopup.find('.popup__close-btn').on('click', function () {
                            popupService.close(currentPopup[0]);
                            window.setTimeout(function () {
                                popupContainer.hide().empty();
                            }, 500);
                        });
                    });
                }
            });

//            closePopupTriggers.forEach(function (element) {
//                element.addEventListener('click', function () {
//                    popupService.close(element.parentNode.parentNode);
//                });
//            });

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
            parseSarineInfos();

//            document.querySelector('.slider').style.display = '';
//            document.querySelector('.preloader').style.display = 'none';
        }
        
        
        function parseSarineInfos() {
            var sarineInfoAttr = 'data-sarine-info';
            
            $('[' + sarineInfoAttr + ']').each(function () {
                var element = $(this),
                    field = element.attr(sarineInfoAttr),
                    value = recurse(stone, field.split('.'));
                
                if (value === (void 0) || value === null) {
                    element.parent().hide();
                } else if (field === 'stoneProperties.carat') {
                    value = parseFloat(value).toFixed(3);
                }
                element.html(value);
            });
        }
        
        
        function markPagesForNullViewers() {
            iterateConfigPages(function (page) {
                var currentSlide = $('ul.slider__list').find('.slide--' + page.code),
                    currentViewer = currentSlide.find('.viewer'),
                    currentViewerName = '';
                if (!currentViewer.length) return;

                currentViewerName = currentViewer.attr('class').replace('viewer ', '');

                if (!document.viewersList[currentViewerName]) {
                    page.skip = true;
                }
            });
        }
  
    
        function iterateConfigPages(iterator) {
            var i, cpl;
            if (typeof iterator !== 'function') return;

            for (i = 0, cpl = wConfig.pages.length; i < cpl; i++) {
                iterator(wConfig.pages[i], i);
            }
        }
    
  
        function readConfig() {
            var elements = {
                    sliderPagesContainer: $('ul.slider__list'),
                    summarySpecsContainer: $('.summary__specs'),
                    tmpSlidesContainer: $('<div/>'),
                    customerLogo: $('.footer__customer__logo'),
                    sliderWrap: $('.slider-wrap'),
                    sliderHeader: $('.slider__header'),
                    aSlider: $('#slider')
                };

            // Substitute fields from config
            $('[data-widgetconfig-value]').each(function (i, elem) {
                var value = $(elem).attr('data-widgetconfig-value');
                if (wConfig[value]) {
                    $(elem).html(wConfig[value]);
                }
            });

            elements.tmpSlidesContainer.append(elements.sliderPagesContainer.find('> .slide'));

            

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

            
            // Add summary page specs
            iterateConfigPages(function (page) {
                if (page.code !== 'summary' || page.skip) return;

                if (page.specs && page.specs.length) {
                    setSummaryPageSpecs(page.specs, elements.summarySpecsContainer);
                }
            });


            // Add classes to slider wrap element: color scheme and widget code
            wConfig.color_scheme && elements.sliderWrap.addClass(wConfig.color_scheme);
            wConfig.widget_brief_code && elements.sliderWrap.addClass(wConfig.widget_brief_code);

            $('.popup-wrap button').attr('tabindex', '-1');
        }
        
        
        function setStyles() {
            var styleConfig = wConfig.styles;
            
            // Set brand color according to config
            if (styleConfig.brandColor) {
                [
                    {selector: '.brand-color',  prop: 'color'},
                    {selector: '.brand-bg, .brand-config .storyline__item--active:before, .brand-config .storyline__item:hover:before, .brand-config .specs__point:before',     prop: 'background'},
                    {selector: '.brand-img svg *',  prop: 'stroke'}
                ].forEach(function (item) {
                    var newStyle = {};
                    newStyle[item.prop] = styleConfig.brandColor + ' !important';
                    jss.set(item.selector, newStyle);
                });
            }
            
            //Set CSS classes for other config fields
            [
                {selector: '.summary__spec__title.config-color', configField: 'summaryLabel'},
                {selector: '.summary__spec__value.config-color', configField: 'summaryValue'},
                {selector: '.brand-config .summary__story', configField: 'summaryNav'},

                {selector: '.config-color.footer__disclaimer', configField: 'conditions'},
                {selector: '.config-color.footer__powered', configField: 'poweredBy'},
            ].forEach(function (item) {
                if ( ! styleConfig[item.configField] ) return;
                jss.set(item.selector, styleConfig[item.configField]);
            });
            
            // Set color for svg images
            try {
                jss.set('.brand-img svg *', {
                    stroke: styleConfig.summaryNav.color
                });
            } catch (e) {}
        }
        
        
        function setTexts() {
            var attrName = 'data-text';
            
            $('[' + attrName + ']').each(function () {
                var $el = $(this),
                    valueFromConfig = '';
                try {
                    valueFromConfig = recurse( window.dynamicText, $el.attr(attrName).split('.') );
                } catch (e) {
                    console.log(e);
                }
                $el.html(valueFromConfig);
            });
        }
        
        
        function setSummaryPageSpecs(specsConfig, specsContainer) {
            specsConfig.forEach(function (aRow) {
                var rowContainer = $('<ul class="summary__specs-row"/>').appendTo(specsContainer);
                if (aRow.length) {
                    aRow.forEach(function (anItem) {
                        var specItem = $('<li class="summary__spec"/>').appendTo(rowContainer);
                        specItem
                                .append( $('<span class="summary__spec__title config-color"/>').attr('data-text', anItem.text) )
                                .append( $('<span class="summary__spec__value config-color"/>').attr('data-sarine-info', anItem.sarineInfoField) );
                        if (anItem.popupId) {
                            specItem.attr('data-popup-id', anItem.popupId)
                                .append($('<span class="q-mark q-mark--small brand-color"/>'));
                        }
                    });
                }
            });
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
})(window, window.document, window.jQuery, window.FastClick, window.classie, window.PopupService, window.videoPlay, window.jss);
