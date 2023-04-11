/**
 * iv-viewer - 2.0.0
 * Author : Sudhanshu Yadav
 * Copyright (c)  2019 to Sudhanshu Yadav, released under the MIT license.
 * git+https://github.com/s-yadav/iv-viewer.git
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ImageViewer = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  // constants
  var ZOOM_CONSTANT = 15; // increase or decrease value for zoom on mouse wheel

  var MOUSE_WHEEL_COUNT = 5; // A mouse delta after which it should stop preventing default behaviour of mouse wheel

  function noop() {} // ease out method

  /*
      t : current time,
      b : intial value,
      c : changed value,
      d : duration
  */

  function easeOutQuart(t, b, c, d) {
    t /= d;
    t -= 1;
    return -c * (t * t * t * t - 1) + b;
  }
  function createElement(options) {
    var elem = document.createElement(options.tagName);
    if (options.id) elem.id = options.id;
    if (options.html) elem.innerHTML = options.html;
    if (options.className) elem.className = options.className;
    if (options.src) elem.src = options.src;
    if (options.style) elem.style.cssText = options.style;
    if (options.child) elem.appendChild(options.child); // Insert before

    if (options.insertBefore) {
      options.parent.insertBefore(elem, options.insertBefore); // Standard append
    } else {
      options.parent.appendChild(elem);
    }

    return elem;
  } // method to add class

  function addClass(el, className) {
    var classNameAry = className.split(' ');

    if (classNameAry.length > 1) {
      classNameAry.forEach(function (classItem) {
        return addClass(el, classItem);
      });
    } else if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += " ".concat(className); // eslint-disable-line no-param-reassign
    }
  } // method to remove class

  function removeClass(el, className) {
    var classNameAry = className.split(' ');

    if (classNameAry.length > 1) {
      classNameAry.forEach(function (classItem) {
        return removeClass(el, classItem);
      });
    } else if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp("(^|\\b)".concat(className.split(' ').join('|'), "(\\b|$)"), 'gi'), ' '); // eslint-disable-line no-param-reassign
    }
  } // function to check if image is loaded

  function imageLoaded(img) {
    return img.complete && (typeof img.naturalWidth === 'undefined' || img.naturalWidth !== 0);
  }
  function toArray(list) {
    if (!(list instanceof NodeList || list instanceof HTMLCollection)) return [list];
    return Array.prototype.slice.call(list);
  }
  function css(elements, properties) {
    var elmArray = toArray(elements);

    if (typeof properties === 'string') {
      return window.getComputedStyle(elmArray[0])[properties];
    }

    elmArray.forEach(function (element) {
      Object.keys(properties).forEach(function (key) {
        var value = properties[key];
        element.style[key] = value; // eslint-disable-line no-param-reassign
      });
    });
    return undefined;
  }
  function removeCss(element, property) {
    element.style.removeProperty(property);
  }
  function wrap(element, _ref) {
    var _ref$tag = _ref.tag,
        tag = _ref$tag === void 0 ? 'div' : _ref$tag,
        className = _ref.className,
        id = _ref.id,
        style = _ref.style;
    var wrapper = document.createElement(tag);
    if (className) wrapper.className = className;
    if (id) wrapper.id = id;
    if (style) wrapper.style = style;
    element.parentNode.insertBefore(wrapper, element);
    element.parentNode.removeChild(element);
    wrapper.appendChild(element);
    return wrapper;
  }
  function unwrap(element) {
    var parent = element.parentNode;

    if (parent !== document.body) {
      parent.parentNode.insertBefore(element, parent);
      parent.parentNode.removeChild(parent);
    }
  }
  function remove(elements) {
    var elmArray = toArray(elements);
    elmArray.forEach(function (element) {
      element.parentNode.removeChild(element);
    });
  }
  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }
  function assignEvent(element, events, handler) {
    if (typeof events === 'string') events = [events];
    events.forEach(function (event) {
      element.addEventListener(event, handler);
    });
    return function () {
      events.forEach(function (event) {
        element.removeEventListener(event, handler);
      });
    };
  }
  function getTouchPointsDistance(touches) {
    var touch0 = touches[0];
    var touch1 = touches[1];
    return Math.sqrt(Math.pow(touch1.pageX - touch0.pageX, 2) + Math.pow(touch1.pageY - touch0.pageY, 2));
  }

  var Slider =
  /*#__PURE__*/
  function () {
    function Slider(container, _ref) {
      var _this = this;

      var _onStart = _ref.onStart,
          _onMove = _ref.onMove,
          onEnd = _ref.onEnd,
          isSliderEnabled = _ref.isSliderEnabled;

      _classCallCheck(this, Slider);

      _defineProperty(this, "startHandler", function (eStart) {
        if (!_this.isSliderEnabled()) return;

        _this.removeListeners();

        eStart.preventDefault();
        var moveHandler = _this.moveHandler,
            endHandler = _this.endHandler,
            onStart = _this.onStart;
        var isTouchEvent = eStart.type === 'touchstart';
        _this.touchMoveEvent = isTouchEvent ? 'touchmove' : 'mousemove';
        _this.touchEndEvent = isTouchEvent ? 'touchend' : 'mouseup';
        _this.sx = isTouchEvent ? eStart.touches[0].clientX : eStart.clientX;
        _this.sy = isTouchEvent ? eStart.touches[0].clientY : eStart.clientY;
        onStart(eStart, {
          x: _this.sx,
          y: _this.sy
        }); // add listeners

        document.addEventListener(_this.touchMoveEvent, moveHandler);
        document.addEventListener(_this.touchEndEvent, endHandler);
        /*
          add end handler in context menu as well.
          As mouseup event is not trigger on context menu open
          https://bugs.chromium.org/p/chromium/issues/detail?id=506801
        */

        document.addEventListener('contextmenu', endHandler);
      });

      _defineProperty(this, "moveHandler", function (eMove) {
        if (!_this.isSliderEnabled()) return;
        eMove.preventDefault();
        var sx = _this.sx,
            sy = _this.sy,
            onMove = _this.onMove;
        var isTouchEvent = _this.touchMoveEvent === 'touchmove'; // get the coordinates

        var mx = isTouchEvent ? eMove.touches[0].clientX : eMove.clientX;
        var my = isTouchEvent ? eMove.touches[0].clientY : eMove.clientY;
        onMove(eMove, {
          dx: mx - sx,
          dy: my - sy,
          mx: mx,
          my: my
        });
      });

      _defineProperty(this, "endHandler", function () {
        if (!_this.isSliderEnabled()) return;

        _this.removeListeners();

        _this.onEnd();
      });

      this.container = container;
      this.isSliderEnabled = isSliderEnabled;
      this.onStart = _onStart || noop;
      this.onMove = _onMove || noop;
      this.onEnd = onEnd || noop;
    }

    _createClass(Slider, [{
      key: "removeListeners",
      // remove previous events if its not removed
      // - Case when while sliding mouse moved out of document and released there
      value: function removeListeners() {
        if (!this.touchMoveEvent) return;
        document.removeEventListener(this.touchMoveEvent, this.moveHandler);
        document.removeEventListener(this.touchEndEvent, this.endHandler);
        document.removeEventListener('contextmenu', this.endHandler);
      }
    }, {
      key: "init",
      value: function init() {
        var _this2 = this;

        ['touchstart', 'mousedown'].forEach(function (evt) {
          _this2.container.addEventListener(evt, _this2.startHandler);
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        var _this3 = this;

        ['touchstart', 'mousedown'].forEach(function (evt) {
          _this3.container.removeEventListener(evt, _this3.startHandler);
        });
        this.removeListeners();
      }
    }]);

    return Slider;
  }();

  var imageViewHtml = "\n  <div class=\"iv-loader\"></div>\n  <div class=\"iv-snap-view\">\n    <div class=\"iv-snap-image-wrap\">\n      <div class=\"iv-snap-handle\"></div>\n    </div>\n    <div class=\"iv-zoom-slider\">\n      <div class=\"iv-zoom-handle\"></div>\n    </div>\n  </div>\n  <div class=\"iv-image-view\" >\n    <div class=\"iv-image-wrap\" ></div>\n  </div>\n";

  var ImageViewer =
  /*#__PURE__*/
  function () {
    function ImageViewer(element) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, ImageViewer);

      _defineProperty(this, "zoom", function (perc, point) {
        var _options = _this._options,
            _elements = _this._elements,
            _state = _this._state;
        var curPerc = _state.zoomValue,
            imageDim = _state.imageDim,
            containerDim = _state.containerDim,
            zoomSliderLength = _state.zoomSliderLength;
        var image = _elements.image,
            zoomHandle = _elements.zoomHandle;
        var maxZoom = _options.maxZoom;
        perc = Math.round(Math.max(100, perc));
        perc = Math.min(maxZoom, perc);
        point = point || {
          x: containerDim.w / 2,
          y: containerDim.h / 2
        };
        var curLeft = parseFloat(css(image, 'left'));
        var curTop = parseFloat(css(image, 'top')); // clear any panning frames

        _this._clearFrames();

        var step = 0;
        var baseLeft = (containerDim.w - imageDim.w) / 2;
        var baseTop = (containerDim.h - imageDim.h) / 2;
        var baseRight = containerDim.w - baseLeft;
        var baseBottom = containerDim.h - baseTop;

        var zoom = function zoom() {
          step++;

          if (step < 16) {
            _this._frames.zoomFrame = requestAnimationFrame(zoom);
          }

          var tickZoom = easeOutQuart(step, curPerc, perc - curPerc, 16);
          var ratio = tickZoom / curPerc;
          var imgWidth = imageDim.w * tickZoom / 100;
          var imgHeight = imageDim.h * tickZoom / 100;
          var newLeft = -((point.x - curLeft) * ratio - point.x);
          var newTop = -((point.y - curTop) * ratio - point.y); // fix for left and top

          newLeft = Math.min(newLeft, baseLeft);
          newTop = Math.min(newTop, baseTop); // fix for right and bottom

          if (newLeft + imgWidth < baseRight) {
            newLeft = baseRight - imgWidth; // newLeft - (newLeft + imgWidth - baseRight)
          }

          if (newTop + imgHeight < baseBottom) {
            newTop = baseBottom - imgHeight; // newTop + (newTop + imgHeight - baseBottom)
          }

          css(image, {
            height: "".concat(imgHeight, "px"),
            width: "".concat(imgWidth, "px"),
            left: "".concat(newLeft, "px"),
            top: "".concat(newTop, "px")
          });
          _this._state.zoomValue = tickZoom;

          _this._resizeSnapHandle(imgWidth, imgHeight, newLeft, newTop); // update zoom handle position


          css(zoomHandle, {
            left: "".concat((tickZoom - 100) * zoomSliderLength / (maxZoom - 100), "px")
          });
        };

        zoom();
      });

      _defineProperty(this, "_clearFrames", function () {
        var _this$_frames = _this._frames,
            slideMomentumCheck = _this$_frames.slideMomentumCheck,
            sliderMomentumFrame = _this$_frames.sliderMomentumFrame,
            zoomFrame = _this$_frames.zoomFrame;
        clearInterval(slideMomentumCheck);
        cancelAnimationFrame(sliderMomentumFrame);
        cancelAnimationFrame(zoomFrame);
      });

      _defineProperty(this, "_resizeSnapHandle", function (imgWidth, imgHeight, imgLeft, imgTop) {
        var _elements = _this._elements,
            _state = _this._state;
        var snapHandle = _elements.snapHandle,
            image = _elements.image;
        var imageDim = _state.imageDim,
            containerDim = _state.containerDim,
            zoomValue = _state.zoomValue,
            snapImageDim = _state.snapImageDim;
        var imageWidth = imgWidth || imageDim.w * zoomValue / 100;
        var imageHeight = imgHeight || imageDim.h * zoomValue / 100;
        var imageLeft = imgLeft || parseFloat(css(image, 'left'));
        var imageTop = imgTop || parseFloat(css(image, 'top'));
        var left = -imageLeft * snapImageDim.w / imageWidth;
        var top = -imageTop * snapImageDim.h / imageHeight;
        var handleWidth = containerDim.w * snapImageDim.w / imageWidth;
        var handleHeight = containerDim.h * snapImageDim.h / imageHeight;
        css(snapHandle, {
          top: "".concat(top, "px"),
          left: "".concat(left, "px"),
          width: "".concat(handleWidth, "px"),
          height: "".concat(handleHeight, "px")
        });
        _this._state.snapHandleDim = {
          w: handleWidth,
          h: handleHeight
        };
      });

      _defineProperty(this, "showSnapView", function (noTimeout) {
        var _this$_state = _this._state,
            snapViewVisible = _this$_state.snapViewVisible,
            zoomValue = _this$_state.zoomValue,
            loaded = _this$_state.loaded;
        var snapView = _this._elements.snapView;
        if (!_this._options.snapView) return;
        if (snapViewVisible || zoomValue <= 100 || !loaded) return;
        clearTimeout(_this._frames.snapViewTimeout);
        _this._state.snapViewVisible = true;
        css(snapView, {
          opacity: 1,
          pointerEvents: 'inherit'
        });

        if (!noTimeout) {
          _this._frames.snapViewTimeout = setTimeout(_this.hideSnapView, 1500);
        }
      });

      _defineProperty(this, "hideSnapView", function () {
        var snapView = _this._elements.snapView;
        css(snapView, {
          opacity: 0,
          pointerEvents: 'none'
        });
        _this._state.snapViewVisible = false;
      });

      _defineProperty(this, "refresh", function () {
        _this._calculateDimensions();

        _this.resetZoom();
      });

      var _this$_findContainerA = this._findContainerAndImageSrc(element, options),
          container = _this$_findContainerA.container,
          domElement = _this$_findContainerA.domElement,
          imageSrc = _this$_findContainerA.imageSrc,
          hiResImageSrc = _this$_findContainerA.hiResImageSrc; // containers for elements


      this._elements = {
        container: container,
        domElement: domElement
      };
      this._options = _objectSpread({}, ImageViewer.defaults, options); // container for all events

      this._events = {}; // container for all timeout and frames

      this._frames = {}; // container for all sliders

      this._sliders = {}; // maintain current state

      this._state = {
        zoomValue: this._options.zoomValue
      };
      this._images = {
        imageSrc: imageSrc,
        hiResImageSrc: hiResImageSrc
      };

      this._init();

      if (imageSrc) {
        this._loadImages();
      } // store reference of imageViewer in domElement


      domElement._imageViewer = this;
    }

    _createClass(ImageViewer, [{
      key: "_findContainerAndImageSrc",
      value: function _findContainerAndImageSrc(element) {
        var domElement = element;
        var imageSrc, hiResImageSrc;

        if (typeof element === 'string') {
          domElement = document.querySelector(element);
        } // throw error if imageViewer is already assigned


        if (domElement._imageViewer) {
          throw new Error('An image viewer is already being initiated on the element.');
        }

        var container = element;

        if (domElement.tagName === 'IMG') {
          imageSrc = domElement.src;
          hiResImageSrc = domElement.getAttribute('high-res-src') || domElement.getAttribute('data-high-res-src'); // wrap the image with iv-container div

          container = wrap(domElement, {
            className: 'iv-container iv-image-mode',
            style: {
              display: 'inline-block',
              overflow: 'hidden'
            }
          }); // hide the image and add iv-original-img class

          css(domElement, {
            opacity: 0,
            position: 'relative',
            zIndex: -1
          });
        } else {
          imageSrc = domElement.getAttribute('src') || domElement.getAttribute('data-src');
          hiResImageSrc = domElement.getAttribute('high-res-src') || domElement.getAttribute('data-high-res-src');
        }

        return {
          container: container,
          domElement: domElement,
          imageSrc: imageSrc,
          hiResImageSrc: hiResImageSrc
        };
      }
    }, {
      key: "_init",
      value: function _init() {
        // initialize the dom elements
        this._initDom(); // initialize slider


        this._initImageSlider();

        this._initSnapSlider();

        this._initZoomSlider(); // enable pinch and zoom feature for touch screens


        this._pinchAndZoom(); // enable scroll zoom interaction


        this._scrollZoom(); // enable double tap to zoom interaction


        this._doubleTapToZoom(); // initialize events


        this._initEvents();
      }
    }, {
      key: "_initDom",
      value: function _initDom() {
        var container = this._elements.container; // add image-viewer layout elements

        createElement({
          tagName: 'div',
          className: 'iv-wrap',
          html: imageViewHtml,
          parent: container
        }); // add container class on the container

        addClass(container, 'iv-container'); // if the element is static position, position it relatively

        if (css(container, 'position') === 'static') {
          css(container, {
            position: 'relative'
          });
        } // save references for later use


        this._elements = _objectSpread({}, this._elements, {
          snapView: container.querySelector('.iv-snap-view'),
          snapImageWrap: container.querySelector('.iv-snap-image-wrap'),
          imageWrap: container.querySelector('.iv-image-wrap'),
          snapHandle: container.querySelector('.iv-snap-handle'),
          zoomHandle: container.querySelector('.iv-zoom-handle')
        });
      }
    }, {
      key: "_initImageSlider",
      value: function _initImageSlider() {
        var _this2 = this;

        var _elements = this._elements;
        var imageWrap = _elements.imageWrap;
        var positions, currentPos;
        /* Add slide interaction to image */

        var imageSlider = new Slider(imageWrap, {
          isSliderEnabled: function isSliderEnabled() {
            var _this2$_state = _this2._state,
                loaded = _this2$_state.loaded,
                zooming = _this2$_state.zooming,
                zoomValue = _this2$_state.zoomValue;
            return loaded && !zooming && zoomValue > 100;
          },
          onStart: function onStart(e, position) {
            var snapSlider = _this2._sliders.snapSlider; // clear all animation frame and interval

            _this2._clearFrames();

            snapSlider.onStart(); // reset positions

            positions = [position, position];
            currentPos = undefined;
            _this2._frames.slideMomentumCheck = setInterval(function () {
              if (!currentPos) return;
              positions.shift();
              positions.push({
                x: currentPos.mx,
                y: currentPos.my
              });
            }, 50);
          },
          onMove: function onMove(e, position) {
            var snapImageDim = _this2._state.snapImageDim;
            var snapSlider = _this2._sliders.snapSlider;

            var imageCurrentDim = _this2._getImageCurrentDim();

            currentPos = position;
            snapSlider.onMove(e, {
              dx: -position.dx * snapImageDim.w / imageCurrentDim.w,
              dy: -position.dy * snapImageDim.h / imageCurrentDim.h
            });
          },
          onEnd: function onEnd() {
            var snapImageDim = _this2._state.snapImageDim;
            var snapSlider = _this2._sliders.snapSlider;

            var imageCurrentDim = _this2._getImageCurrentDim(); // clear all animation frame and interval


            _this2._clearFrames();

            var step, positionX, positionY;
            var xDiff = positions[1].x - positions[0].x;
            var yDiff = positions[1].y - positions[0].y;

            var momentum = function momentum() {
              if (step <= 60) {
                _this2._frames.sliderMomentumFrame = requestAnimationFrame(momentum);
              }

              positionX += easeOutQuart(step, xDiff / 3, -xDiff / 3, 60);
              positionY += easeOutQuart(step, yDiff / 3, -yDiff / 3, 60);
              snapSlider.onMove(null, {
                dx: -(positionX * snapImageDim.w / imageCurrentDim.w),
                dy: -(positionY * snapImageDim.h / imageCurrentDim.h)
              });
              step++;
            };

            if (Math.abs(xDiff) > 30 || Math.abs(yDiff) > 30) {
              step = 1;
              positionX = currentPos.dx;
              positionY = currentPos.dy;
              momentum();
            }
          }
        });
        imageSlider.init();
        this._sliders.imageSlider = imageSlider;
      }
    }, {
      key: "_initSnapSlider",
      value: function _initSnapSlider() {
        var _this3 = this;

        var snapHandle = this._elements.snapHandle;
        var startHandleTop, startHandleLeft;
        var snapSlider = new Slider(snapHandle, {
          isSliderEnabled: function isSliderEnabled() {
            return _this3._state.loaded;
          },
          onStart: function onStart() {
            var _this3$_frames = _this3._frames,
                slideMomentumCheck = _this3$_frames.slideMomentumCheck,
                sliderMomentumFrame = _this3$_frames.sliderMomentumFrame;
            startHandleTop = parseFloat(css(snapHandle, 'top'));
            startHandleLeft = parseFloat(css(snapHandle, 'left')); // stop momentum on image

            clearInterval(slideMomentumCheck);
            cancelAnimationFrame(sliderMomentumFrame);
          },
          onMove: function onMove(e, position) {
            var _this3$_state = _this3._state,
                snapHandleDim = _this3$_state.snapHandleDim,
                snapImageDim = _this3$_state.snapImageDim;
            var image = _this3._elements.image;

            var imageCurrentDim = _this3._getImageCurrentDim(); // find handle left and top and make sure they lay between the snap image


            var maxLeft = Math.max(snapImageDim.w - snapHandleDim.w, startHandleLeft);
            var maxTop = Math.max(snapImageDim.h - snapHandleDim.h, startHandleTop);
            var minLeft = Math.min(0, startHandleLeft);
            var minTop = Math.min(0, startHandleTop);
            var left = clamp(startHandleLeft + position.dx, minLeft, maxLeft);
            var top = clamp(startHandleTop + position.dy, minTop, maxTop);
            var imgLeft = -left * imageCurrentDim.w / snapImageDim.w;
            var imgTop = -top * imageCurrentDim.h / snapImageDim.h;
            css(snapHandle, {
              left: "".concat(left, "px"),
              top: "".concat(top, "px")
            });
            css(image, {
              left: "".concat(imgLeft, "px"),
              top: "".concat(imgTop, "px")
            });
          }
        });
        snapSlider.init();
        this._sliders.snapSlider = snapSlider;
      }
    }, {
      key: "_initZoomSlider",
      value: function _initZoomSlider() {
        var _this4 = this;

        var _this$_elements = this._elements,
            snapView = _this$_elements.snapView,
            zoomHandle = _this$_elements.zoomHandle; // zoom in zoom out using zoom handle

        var sliderElm = snapView.querySelector('.iv-zoom-slider');
        var leftOffset, handleWidth; // on zoom slider we have to follow the mouse and set the handle to its position.

        var zoomSlider = new Slider(sliderElm, {
          isSliderEnabled: function isSliderEnabled() {
            return _this4._state.loaded;
          },
          onStart: function onStart(eStart) {
            var slider = _this4._sliders.zoomSlider;
            leftOffset = sliderElm.getBoundingClientRect().left + document.body.scrollLeft;
            handleWidth = parseInt(css(zoomHandle, 'width'), 10); // move the handle to current mouse position

            slider.onMove(eStart);
          },
          onMove: function onMove(e) {
            var maxZoom = _this4._options.maxZoom;
            var zoomSliderLength = _this4._state.zoomSliderLength;
            var pageX = e.pageX !== undefined ? e.pageX : e.touches[0].pageX;
            var newLeft = clamp(pageX - leftOffset - handleWidth / 2, 0, zoomSliderLength);
            var zoomValue = 100 + (maxZoom - 100) * newLeft / zoomSliderLength;

            _this4.zoom(zoomValue);
          }
        });
        zoomSlider.init();
        this._sliders.zoomSlider = zoomSlider;
      }
    }, {
      key: "_initEvents",
      value: function _initEvents() {
        this._snapViewEvents(); // handle window resize


        if (this._options.refreshOnResize) {
          this._events.onWindowResize = assignEvent(window, 'resize', this.refresh);
        }
      }
    }, {
      key: "_snapViewEvents",
      value: function _snapViewEvents() {
        var _this5 = this;

        var _this$_elements2 = this._elements,
            imageWrap = _this$_elements2.imageWrap,
            snapView = _this$_elements2.snapView; // show snapView on mouse move

        this._events.snapViewOnMouseMove = assignEvent(imageWrap, ['touchmove', 'mousemove'], function () {
          _this5.showSnapView();
        }); // keep showing snapView if on hover over it without any timeout

        this._events.mouseEnterSnapView = assignEvent(snapView, ['mouseenter', 'touchstart'], function () {
          _this5._state.snapViewVisible = false;

          _this5.showSnapView(true);
        }); // on mouse leave set timeout to hide snapView

        this._events.mouseLeaveSnapView = assignEvent(snapView, ['mouseleave', 'touchend'], function () {
          _this5._state.snapViewVisible = false;

          _this5.showSnapView();
        });
      }
    }, {
      key: "_pinchAndZoom",
      value: function _pinchAndZoom() {
        var _this6 = this;

        var _this$_elements3 = this._elements,
            imageWrap = _this$_elements3.imageWrap,
            container = _this$_elements3.container; // apply pinch and zoom feature

        var onPinchStart = function onPinchStart(eStart) {
          var _this6$_state = _this6._state,
              loaded = _this6$_state.loaded,
              startZoomValue = _this6$_state.zoomValue;
          var events = _this6._events;
          if (!loaded) return;
          var touch0 = eStart.touches[0];
          var touch1 = eStart.touches[1];

          if (!(touch0 && touch1)) {
            return;
          }

          _this6._state.zooming = true;
          var contOffset = container.getBoundingClientRect(); // find distance between two touch points

          var startDist = getTouchPointsDistance(eStart.touches); // find the center for the zoom

          var center = {
            x: (touch1.pageX + touch0.pageX) / 2 - (contOffset.left + document.body.scrollLeft),
            y: (touch1.pageY + touch0.pageY) / 2 - (contOffset.top + document.body.scrollTop)
          };

          var moveListener = function moveListener(eMove) {
            // eMove.preventDefault();
            var newDist = getTouchPointsDistance(eMove.touches);
            var zoomValue = startZoomValue + (newDist - startDist) / 2;

            _this6.zoom(zoomValue, center);
          };

          var endListener = function endListener() {
            // unbind events
            events.pinchMove();
            events.pinchEnd();
            _this6._state.zooming = false;
          }; // remove events if already assigned


          if (events.pinchMove) events.pinchMove();
          if (events.pinchEnd) events.pinchEnd(); // assign events

          events.pinchMove = assignEvent(document, 'touchmove', moveListener);
          events.pinchEnd = assignEvent(document, 'touchend', endListener);
        };

        this._events.pinchStart = assignEvent(imageWrap, 'touchstart', onPinchStart);
      }
    }, {
      key: "_scrollZoom",
      value: function _scrollZoom() {
        var _this7 = this;

        /* Add zoom interaction in mouse wheel */
        var _options = this._options;
        var _this$_elements4 = this._elements,
            container = _this$_elements4.container,
            imageWrap = _this$_elements4.imageWrap;
        var changedDelta = 0;

        var onMouseWheel = function onMouseWheel(e) {
          var _this7$_state = _this7._state,
              loaded = _this7$_state.loaded,
              zoomValue = _this7$_state.zoomValue;
          if (!_options.zoomOnMouseWheel || !loaded) return; // clear all animation frame and interval

          _this7._clearFrames(); // cross-browser wheel delta


          var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail || -e.deltaY));
          var newZoomValue = zoomValue * (100 + delta * ZOOM_CONSTANT) / 100;

          if (!(newZoomValue >= 100 && newZoomValue <= _options.maxZoom)) {
            changedDelta += Math.abs(delta);
          } else {
            changedDelta = 0;
          }

          e.preventDefault();
          if (changedDelta > MOUSE_WHEEL_COUNT) return;
          var contOffset = container.getBoundingClientRect();
          var x = (e.pageX || e.pageX) - (contOffset.left + document.body.scrollLeft);
          var y = (e.pageY || e.pageY) - (contOffset.top + document.body.scrollTop);

          _this7.zoom(newZoomValue, {
            x: x,
            y: y
          }); // show the snap viewer


          _this7.showSnapView();
        };

        this._ev = assignEvent(imageWrap, 'wheel', onMouseWheel);
      }
    }, {
      key: "_doubleTapToZoom",
      value: function _doubleTapToZoom() {
        var _this8 = this;

        var imageWrap = this._elements.imageWrap; // handle double tap for zoom in and zoom out

        var touchTime = 0;
        var point;

        var onDoubleTap = function onDoubleTap(e) {
          if (touchTime === 0) {
            touchTime = Date.now();
            point = {
              x: e.pageX,
              y: e.pageY
            };
          } else if (Date.now() - touchTime < 500 && Math.abs(e.pageX - point.x) < 50 && Math.abs(e.pageY - point.y) < 50) {
            if (_this8._state.zoomValue === _this8._options.zoomValue) {
              _this8.zoom(200);
            } else {
              _this8.resetZoom();
            }

            touchTime = 0;
          } else {
            touchTime = 0;
          }
        };

        assignEvent(imageWrap, 'click', onDoubleTap);
      }
    }, {
      key: "_getImageCurrentDim",
      value: function _getImageCurrentDim() {
        var _this$_state2 = this._state,
            zoomValue = _this$_state2.zoomValue,
            imageDim = _this$_state2.imageDim;
        return {
          w: imageDim.w * (zoomValue / 100),
          h: imageDim.h * (zoomValue / 100)
        };
      }
    }, {
      key: "_loadImages",
      value: function _loadImages() {
        var _this9 = this;

        var _images = this._images,
            _elements = this._elements;
        var imageSrc = _images.imageSrc,
            hiResImageSrc = _images.hiResImageSrc;
        var container = _elements.container,
            snapImageWrap = _elements.snapImageWrap,
            imageWrap = _elements.imageWrap;
        var ivLoader = container.querySelector('.iv-loader'); // remove old images

        remove(container.querySelectorAll('.iv-snap-image, .iv-image')); // add snapView image

        var snapImage = createElement({
          tagName: 'img',
          className: 'iv-snap-image',
          src: imageSrc,
          insertBefore: snapImageWrap.firstChild,
          parent: snapImageWrap
        }); // add image

        var image = createElement({
          tagName: 'img',
          className: 'iv-image iv-small-image',
          src: imageSrc,
          parent: imageWrap
        });
        this._state.loaded = false; // store image reference in _elements

        this._elements.image = image;
        this._elements.snapImage = snapImage;
        css(ivLoader, {
          display: 'block'
        }); // keep visibility hidden until image is loaded

        css(image, {
          visibility: 'hidden'
        }); // hide snap view if open

        this.hideSnapView();

        var onImageLoad = function onImageLoad() {
          // hide the iv loader
          css(ivLoader, {
            display: 'none'
          }); // show the image

          css(image, {
            visibility: 'visible'
          }); // load high resolution image if provided

          if (hiResImageSrc) {
            _this9._loadHighResImage(hiResImageSrc);
          } // set loaded flag to true


          _this9._state.loaded = true; // calculate the dimension

          _this9._calculateDimensions(); // reset the zoom


          _this9.resetZoom();
        };

        if (imageLoaded(image)) {
          onImageLoad();
        } else {
          this._events.imageLoad = assignEvent(image, 'load', onImageLoad);
        }
      }
    }, {
      key: "_loadHighResImage",
      value: function _loadHighResImage(hiResImageSrc) {
        var _this10 = this;

        var _this$_elements5 = this._elements,
            imageWrap = _this$_elements5.imageWrap,
            container = _this$_elements5.container;
        var lowResImg = this._elements.image;
        var hiResImage = createElement({
          tagName: 'img',
          className: 'iv-image iv-large-image',
          src: hiResImageSrc,
          parent: imageWrap,
          style: lowResImg.style.cssText
        }); // add all the style attributes from lowResImg to highResImg

        hiResImage.style.cssText = lowResImg.style.cssText;
        this._elements.image = container.querySelectorAll('.iv-image');

        var onHighResImageLoad = function onHighResImageLoad() {
          // remove the low size image and set this image as default image
          remove(lowResImg);
          _this10._elements.image = hiResImage; // this._calculateDimensions();
        };

        if (imageLoaded(hiResImage)) {
          onHighResImageLoad();
        } else {
          this._events.hiResImageLoad = assignEvent(hiResImage, 'load', onHighResImageLoad);
        }
      }
    }, {
      key: "_calculateDimensions",
      value: function _calculateDimensions() {
        var _this$_elements6 = this._elements,
            image = _this$_elements6.image,
            container = _this$_elements6.container,
            snapView = _this$_elements6.snapView,
            snapImage = _this$_elements6.snapImage,
            zoomHandle = _this$_elements6.zoomHandle; // calculate content width of image and snap image

        var imageWidth = parseInt(css(image, 'width'), 10);
        var imageHeight = parseInt(css(image, 'height'), 10);
        var contWidth = parseInt(css(container, 'width'), 10);
        var contHeight = parseInt(css(container, 'height'), 10);
        var snapViewWidth = snapView.clientWidth;
        var snapViewHeight = snapView.clientHeight; // set the container dimension

        this._state.containerDim = {
          w: contWidth,
          h: contHeight
        }; // set the image dimension

        var imgWidth;
        var imgHeight;
        var ratio = imageWidth / imageHeight;
        imgWidth = imageWidth > imageHeight && contHeight >= contWidth || ratio * contHeight > contWidth ? contWidth : ratio * contHeight;
        imgWidth = Math.min(imgWidth, imageWidth);
        imgHeight = imgWidth / ratio;
        this._state.imageDim = {
          w: imgWidth,
          h: imgHeight
        }; // reset image position and zoom

        css(image, {
          width: "".concat(imgWidth, "px"),
          height: "".concat(imgHeight, "px"),
          left: "".concat((contWidth - imgWidth) / 2, "px"),
          top: "".concat((contHeight - imgHeight) / 2, "px"),
          maxWidth: 'none',
          maxHeight: 'none'
        }); // set the snap Image dimension

        var snapWidth = imgWidth > imgHeight ? snapViewWidth : imgWidth * snapViewHeight / imgHeight;
        var snapHeight = imgHeight > imgWidth ? snapViewHeight : imgHeight * snapViewWidth / imgWidth;
        this._state.snapImageDim = {
          w: snapWidth,
          h: snapHeight
        };
        css(snapImage, {
          width: "".concat(snapWidth, "px"),
          height: "".concat(snapHeight, "px")
        }); // calculate zoom slider area

        this._state.zoomSliderLength = snapViewWidth - zoomHandle.offsetWidth;
      }
    }, {
      key: "resetZoom",
      value: function resetZoom() {
        var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var zoomValue = this._options.zoomValue;

        if (!animate) {
          this._state.zoomValue = zoomValue;
        }

        this.zoom(zoomValue);
      }
    }, {
      key: "load",
      value: function load(imageSrc, hiResImageSrc) {
        this._images = {
          imageSrc: imageSrc,
          hiResImageSrc: hiResImageSrc
        };

        this._loadImages();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        var _this$_elements7 = this._elements,
            container = _this$_elements7.container,
            domElement = _this$_elements7.domElement; // destroy all the sliders

        Object.entries(this._sliders).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              slider = _ref2[1];

          slider.destroy();
        }); // unbind all events

        Object.entries(this._events).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              key = _ref4[0],
              unbindEvent = _ref4[1];

          unbindEvent();
        }); // clear all the frames

        this._clearFrames(); // remove html from the container


        remove(container.querySelector('.iv-wrap')); // remove iv-container class from container

        removeClass(container, 'iv-container'); // remove added style from container

        removeCss(document.querySelector('html'), 'relative'); // if container has original image, unwrap the image and remove the class
        // which will happen when domElement is not the container

        if (domElement !== container) {
          unwrap(domElement);
        } // remove imageViewer reference from dom element


        domElement._imageViewer = null;
      }
    }]);

    return ImageViewer;
  }();

  ImageViewer.defaults = {
    zoomValue: 100,
    snapView: true,
    maxZoom: 500,
    refreshOnResize: true,
    zoomOnMouseWheel: true
  };

  var fullScreenHtml = "\n  <div class=\"iv-fullscreen-container\"></div>\n  <div class=\"iv-fullscreen-close\"></div>\n";

  var FullScreenViewer =
  /*#__PURE__*/
  function (_ImageViewer) {
    _inherits(FullScreenViewer, _ImageViewer);

    function FullScreenViewer() {
      var _this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, FullScreenViewer);

      var fullScreenElem = createElement({
        tagName: 'div',
        className: 'iv-fullscreen',
        html: fullScreenHtml,
        parent: document.body
      });
      var container = fullScreenElem.querySelector('.iv-fullscreen-container'); // call the ImageViewer constructor

      _this = _possibleConstructorReturn(this, _getPrototypeOf(FullScreenViewer).call(this, container, _objectSpread({}, options, {
        refreshOnResize: false
      }))); // add fullScreenElem on element list

      _defineProperty(_assertThisInitialized(_this), "hide", function () {
        // hide the fullscreen
        css(_this._elements.fullScreen, {
          display: 'none'
        }); // enable scroll

        removeCss(document.querySelector('html'), 'overflow'); // remove window event

        _this._events.onWindowResize();
      });

      _this._elements.fullScreen = fullScreenElem;

      _this._initFullScreenEvents();

      return _this;
    }

    _createClass(FullScreenViewer, [{
      key: "_initFullScreenEvents",
      value: function _initFullScreenEvents() {
        var fullScreen = this._elements.fullScreen;
        var closeBtn = fullScreen.querySelector('.iv-fullscreen-close'); // add close button event

        this._events.onCloseBtnClick = assignEvent(closeBtn, 'click', this.hide);
      }
    }, {
      key: "show",
      value: function show(imageSrc, hiResImageSrc) {
        // show the element
        css(this._elements.fullScreen, {
          display: 'block'
        }); // if image source is provide load image source

        if (imageSrc) {
          this.load(imageSrc, hiResImageSrc);
        } // handle window resize


        this._events.onWindowResize = assignEvent(window, 'resize', this.refresh); // disable scroll on html

        css(document.querySelector('html'), {
          overflow: 'hidden'
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        var fullScreen = this._elements.fullScreen; // destroy image viewer

        _get(_getPrototypeOf(FullScreenViewer.prototype), "destroy", this).call(this); // remove the element


        remove(fullScreen);
      }
    }]);

    return FullScreenViewer;
  }(ImageViewer);

  ImageViewer.FullScreenViewer = FullScreenViewer;

  return ImageViewer;

}));
