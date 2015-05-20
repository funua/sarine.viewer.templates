
/*!
 sarine.viewer.manager - v0.0.24 -  Sunday, March 22nd, 2015, 3:30:35 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
 */

(function () {
    var ViewerManger;

    ViewerManger = (function () {
        var addViewer, bindElementToSelector, findAttribute, fromTag, getPath, jsons, loadTemplate, logicPath, logicRoot, recurse, stoneViews, template, toTag, viewers;

        viewers = [];

        stoneViews = void 0;

        fromTag = void 0;

        toTag = void 0;

        stoneViews = void 0;

        template = void 0;

        jsons = void 0;

        logicRoot = void 0;

        logicPath = void 0;

        ViewerManger.prototype.bind = Error;

        getPath = function (src) {
            var arr;
            arr = src.split("/");
            arr.pop();
            return arr.join("/");
        };

        function ViewerManger(option) {
            fromTag = option.fromTag, toTag = option.toTag, stoneViews = option.stoneViews, template = option.template, jsons = option.jsons, logicRoot = option.logicRoot;
            logicRoot = stoneViews.viewersBaseUrl + "atomic/{version}/js/";
            jsons = stoneViews.viewersBaseUrl + "atomic/{version}/jsons/";
            viewers = [];
            this.bind = option.template ? loadTemplate : bindElementToSelector;
        }

        bindElementToSelector = function (selector) {
            var arrDefer, defer, _t;
            defer = $.Deferred();
            arrDefer = [];
            _t = this;
            $(selector).find(fromTag).each((function (_this) {
                return function (i, v) {
                    var active, coordinates, menu, order, toElement, type;
                    toElement = $("<" + toTag + ">");
                    type = $(v).attr("viewer");
                    order = $(v).attr('order') || 99;
                    toElement.data({
                        "type": $(v).attr("viewer"),
                        "order": order,
                        "version": $(v).attr("version")
                    });
                    toElement.attr({
                        "id": "viewr_" + i,
                        "order": order
                    });
                    if (type === "loupe3DFullInspection") {
                        menu = $(v).attr('menu') || true;
                        coordinates = $(v).attr('coordinates') || true;
                        active = $(v).attr('active') || true;
                        toElement.data({
                            "menu": menu,
                            "coordinates": coordinates,
                            "active": active
                        });
                        toElement.attr({
                            "menu": menu,
                            "coordinates": coordinates,
                            "active": active
                        });
                    }
                    toElement.addClass("viewer " + type);
                    $(v).replaceWith(toElement);
                    return arrDefer.push(addViewer(type, toElement));
                };
            })(this));
            $(selector).find('*[data-sarine-info]').each((function (_this) {
                return function (i, v) {
                    var $el;
                    $el = $(v);
                    return $el.text(findAttribute(stones[0], $el.data('sarineInfo')));
                };
            })(this));
            $.when.apply($, arrDefer).then(function () {
                return defer.resolve();
            });
            return defer;
        };

        recurse = function (o, props) {
            if (props.length === 0) {
                return o;
            }
            if (!o) {
                return void 0;
            }
            return recurse(o[props.shift()], props);
        };

        findAttribute = function (obj, ns) {
            return recurse(obj, ns.split('.'));
        };

        loadTemplate = function (selector) {
            var defer, deferArr, scripts;
            defer = $.Deferred();
            deferArr = [];
            scripts = [];
            $("<div>").load(template, function (a, b, c) {
                $(selector).prepend($(a).filter((function (_this) {
                    return function (i, v) {
                        if (v.tagName === "SCRIPT") {
                            if (v.src && !$(v).attr('data-preserve-path')) {
                                deferArr.push($.Deferred());
                                
                                // replace path for widgetConfig.js only
                                if (v.src.indexOf('widgetConfig.js') !== -1) {
                                    v.src = v.src.replace(getPath(location.origin + location.pathname), getPath(template));
                                }
                                
//                                v.src = v.src.replace(getPath(location.origin + location.pathname), getPath(template));
                                $.getScript(v.src, function () {
                                    deferArr.pop();
                                    if (deferArr.length === 0) {
                                        $(selector).append(scripts);
                                        return bindElementToSelector(selector).then(function () {
                                            return defer.resolve();
                                        });
                                    }
                                });
                            } else {
                                scripts.push(v);
                            }
                            $(v).remove();
                            return false;
                        }
                        if (v.tagName === "LINK" && v.href) {
                            v.href = v.href.replace(getPath(location.origin + location.pathname), getPath(template));
                        }
                        return true;
                    };
                })(this)));
                if (deferArr.length === 0) {
                    return bindElementToSelector(selector).then(defer.resolve);
                }
            });
            return defer.then(function () {
                return $(document).trigger("loadTemplate");
            });
        };

        addViewer = function (type, toElement) {
            var callbackPic, data, defer, path, s, src, url;
            defer = $.Deferred();
            data = void 0;
            callbackPic = void 0;
            $.ajaxSetup({
                async: false
            });
            $.getJSON(jsons.replace("{version}", toElement.data("version") || "v1") + type + ".json", (function (_this) {
                return function (d) {
                    return data = d;
                };
            })(this));
            $.ajaxSetup({
                async: true
            });
            callbackPic = data.callbackPic || jsons.replace("{version}", toElement.data("version") || "v1") + "no_stone.png";
            if (stoneViews.viewers[type] === null) {
                src = callbackPic.split("/");
                path = src.pop();
                stoneViews.viewers[type] = src.join("/") + "/";
                data.instance = "SarineImage";
                data.name = "sarine.viewer.image";
                data.args = {
                    "imagesArr": [path]
                };
            }
            url = logicRoot.replace("{version}", toElement.data("version") || "v1") + data.name + (location.hash.indexOf("debug") === 1 ? ".bundle.js" : ".bundle.min.js");
            s = $("<script>", {
                type: "text/javascript"
            }).appendTo("body").end()[0];
            s.onload = function () {
                var inst;
                inst = eval(data.instance);
                viewers.push(new inst($.extend({
                    src: stoneViews.viewers[type],
                    element: toElement,
                    callbackPic: callbackPic
                }, data.args)));
                return defer.resolve();
            };
            s.src = url;
            return defer;
        };

        ViewerManger.prototype.getViewers = function () {
            return viewers;
        };

        ViewerManger.prototype.sortByOrder = function (viewersArr) {
            var obj;
            obj = [];
            viewersArr.forEach(function (v) {
                var order;
                order = v.element.data('order');
                if (obj[order] === void 0) {
                    obj[order] = [];
                }
                return obj[order].push(v);
            });
            return obj.filter(function (v) {
                return v;
            });
        };

        ViewerManger.prototype.init_list = function (list, method, defer) {
            var arr, current, pmId, v, _list, _method, _t;
            _t = this;
            _list = list;
            _method = method;
            defer = defer || $.Deferred();
            current = list.shift();
            arr = [];
            for (v in current) {
                pmId = current[v].id + "_" + current[v].element.data('type');
                $(document).trigger(_method + "_start", [
                    {
                        Id: pmId
                    }
                ]);
                arr.push(current[v][_method]().then((function (pmId) {
                    return function () {
                        return $(document).trigger(_method + "_end", [
                            {
                                Id: pmId
                            }
                        ]);
                    };
                })(pmId)));
            }
            $.when.apply($, arr).then(function () {
                if (_list.length === 0) {
                    return defer.resolve();
                } else {
                    return _t.init_list(_list, _method, defer);
                }
            });
            return defer;
        };

        ViewerManger.prototype.first_init = function () {
            var defer;
            defer = $.Deferred();
            this.init_list(this.sortByOrder(viewers), "first_init").then(defer.resolve);
            return defer;
        };

        ViewerManger.prototype.full_init = function () {
            var defer;
            defer = $.Deferred();
            this.init_list(this.sortByOrder(viewers), "full_init").then(defer.resolve);
            return defer;
        };

        ViewerManger.prototype.stop = function () {
            return viewers.forEach(function (v) {
                return v.stop();
            });
        };

        ViewerManger.prototype.play = function () {
            return viewers.forEach(function (v) {
                return v.play(true);
            });
        };

        return ViewerManger;

    })();

    this.ViewerManger = ViewerManger;

}).call(this);
