/*! sarine.viewer.dynamic.light - v0.0.1 -  2015-02-09 */
(function () {
    var Light, Viewer,
      __hasProp = {}.hasOwnProperty,
      __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

    Viewer = (function () {
        var error, rm;

        rm = ResourceManager.getInstance();

        function Viewer(options) {
            this.first_init_defer = $.Deferred();
            this.full_init_defer = $.Deferred();
            this.src = options.src, this.element = options.element, this.autoPlay = options.autoPlay;
            this.id = this.element[0].id;
            this.element = this.convertElement();
            Object.getOwnPropertyNames(Viewer.prototype).forEach(function (k) {
                if (this[k].name === "Error") {
                    return console.error(this.id, k, "Must be implement", this);
                }
            }, this);
            this.element.data("class", this);
            this.element.on("play", function (e) {
                return $(e.target).data("class").play.apply($(e.target).data("class"), [true]);
            });
            this.element.on("stop", function (e) {
                return $(e.target).data("class").stop.apply($(e.target).data("class"), [true]);
            });
            this.element.on("cancel", function (e) {
                return $(e.target).data("class").cancel().apply($(e.target).data("class"), [true]);
            });
        }

        error = function () {
            return console.error(this.id, "must be implement");
        };

        Viewer.prototype.first_init = Error;

        Viewer.prototype.full_init = Error;

        Viewer.prototype.play = Error;

        Viewer.prototype.stop = Error;

        Viewer.prototype.convertElement = Error;

        Viewer.prototype.cancel = function () {
            return rm.cancel(this);
        };

        Viewer.prototype.loadImage = function (src) {
            return rm.loadImage.apply(this, [src]);
        };

        Viewer.prototype.setTimeout = function (fun, delay) {
            return rm.setTimeout.apply(this, [this.delay]);
        };

        return Viewer;

    })();

    console.log("");

    this.Viewer = Viewer;

    Viewer.Dynamic = (function (_super) {
        __extends(Dynamic, _super);

        Dynamic.playing = false;

        Dynamic.prototype.nextImage = Error;

        function Dynamic(options) {
            Dynamic.__super__.constructor.call(this, options);
            this.delay = 50;
            Object.getOwnPropertyNames(Viewer.Dynamic.prototype).forEach(function (k) {
                if (this[k].name === "Error") {
                    return console.error(this.id, k, "Must be implement", this);
                }
            }, this);
        }

        Dynamic.prototype.play = function (force, delay) {
            var _t;
            if (force) {
                this.playing = true;
            }
            this.nextImage.apply(this);
            if (this.playing) {
                _t = this;
                return this.setTimeout(this.delay).then(_t.play);
            }
        };

        Dynamic.prototype.stop = function () {
            return this.playing = false;
        };

        return Dynamic;

    })(Viewer);

    Light = (function (_super) {
        var allDeferreds, amountOfImages, counter, downloadImagesArr, imageIndex, imagesArr, isEven, setSpeed, sliceCount, speed;

        __extends(Light, _super);

        amountOfImages = 48;

        imageIndex = 0;

        allDeferreds = {};

        imagesArr = {};

        downloadImagesArr = {};

        isEven = true;

        setSpeed = 100;

        speed = 100;

        sliceCount = 0;

        counter = 1;

        function Light(options) {
            var index, _i;
            Light.__super__.constructor.call(this, options);
            this.sliceDownload = options.sliceDownload;
            this.sliceDownload = this.sliceDownload | 3;
            this.imagesArr = {};
            this.downloadImagesArr = {};
            this.first_init_defer = $.Deferred();
            this.full_init_defer = $.Deferred();
            for (index = _i = 0; 0 <= amountOfImages ? _i <= amountOfImages : _i >= amountOfImages; index = 0 <= amountOfImages ? ++_i : --_i) {
                this.imagesArr[index] = void 0;
            }
        }

        Light.prototype.convertElement = function () {
            this.canvas = $("<canvas>");
            this.ctx = this.canvas[0].getContext('2d');
            return this.element.append(this.canvas);
        };

        Light.prototype.first_init = function () {
            var defer, _t;
            defer = this.first_init_defer;
            defer.notify(this.id + " : start load first image");
            _t = this;
            this.loadImage(this.src + "00.png").then(function (img) {
                _t.canvas.attr({
                    'width': img.width,
                    'height': img.height
                });
                _t.ctx.drawImage(img, 0, 0);
                return defer.resolve();
            });
            return defer;
        };

        Light.prototype.loadParts = function (gap, defer) {
            var downloadImages, index, _t;
            gap = gap || 0;
            defer = defer || $.Deferred();
            downloadImages = [];
            _t = this;
            $.when.apply($, (function () {
                var _i, _len, _ref, _results;
                _ref = (function () {
                    var _j, _len, _ref, _results1;
                    _ref = Object.getOwnPropertyNames(this.imagesArr);
                    _results1 = [];
                    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
                        index = _ref[_j];
                        if ((index + gap) % this.sliceDownload === 0) {
                            _results1.push(index);
                        }
                    }
                    return _results1;
                }).call(this);
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    index = _ref[_i];
                    _results.push((function (index) {
                        return _t.loadImage(_t.src + (index < 10 ? "0" + index : index) + ".png").then(function (img) {
                            return downloadImages.push(img);
                        });
                    })(index));
                }
                return _results;
            }).call(this)).then(function () {
                var img, _fn, _i, _len;
                _fn = function (img) {
                    var index;
                    index = parseInt(img.src.match(/\d+(?=.png)/)[0]);
                    return downloadImagesArr[index] = imagesArr[index] = img;
                };
                for (_i = 0, _len = downloadImages.length; _i < _len; _i++) {
                    img = downloadImages[_i];
                    _fn(img);
                }
                if (Object.getOwnPropertyNames(imagesArr).length === (amountOfImages + 1)) {
                    defer.resolve();
                } else {
                    _t.loadParts(++gap, defer);
                }
                return _t.delay = (_t.sliceDownload / gap) * setSpeed;
            });
            return defer;
        };

        Light.prototype.full_init = function () {
            var defer;
            defer = this.full_init_defer;
            defer.notify(this.id + " : start load all images");
            this.loadParts();
            return defer;
        };

        Light.prototype.nextImage = function () {
            var indexer;
            indexer = Object.getOwnPropertyNames(downloadImagesArr).map(function (v) {
                return parseInt(v);
            });
            if (indexer.length > 1) {
                this.ctx.drawImage(downloadImagesArr[indexer[counter]], 0, 0);
                return counter = (counter + 1) % indexer.length;
            }
        };

        return Light;

    })(Viewer.Dynamic);

    this.Light = Light;

}).call(this);