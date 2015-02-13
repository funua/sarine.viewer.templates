(function () {
    var PDF, Viewer,
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

    PDF = (function (_super) {
        __extends(PDF, _super);

        function PDF(options) {
            PDF.__super__.constructor.call(this, options);
            this.pdfName = options.pdfName;
        }

        PDF.prototype.convertElement = function () {
            this.embed = $("<embed>");
            return this.element.append(this.embed);
        };

        PDF.prototype.first_init = function () {
            return this.embed.attr({
                src: this.src + this.pdfName,
                type: 'application/pdf',
                width: '100%',
                height: '100%'
            });
        };

        PDF.prototype.full_init = function () { };

        PDF.prototype.play = function () { };

        PDF.prototype.stop = function () { };

        return PDF;

    })(Viewer);

    this.PDF = PDF;

}).call(this);