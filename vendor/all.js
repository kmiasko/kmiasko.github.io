'use strict';

/*!
	Autosize 4.0.0
	license: MIT
	http://www.jacklmoore.com/autosize
*/
(function () {
	var global = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
	var factory = arguments[1];

	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.autosize = mod.exports;
	}
})(undefined, function (exports, module) {
	'use strict';

	var map = typeof Map === "function" ? new Map() : function () {
		var keys = [];
		var values = [];

		return {
			has: function has(key) {
				return keys.indexOf(key) > -1;
			},
			get: function get(key) {
				return values[keys.indexOf(key)];
			},
			set: function set(key, value) {
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					values.push(value);
				}
			},
			'delete': function _delete(key) {
				var index = keys.indexOf(key);
				if (index > -1) {
					keys.splice(index, 1);
					values.splice(index, 1);
				}
			}
		};
	}();

	var createEvent = function createEvent(name) {
		return new Event(name, { bubbles: true });
	};
	try {
		new Event('test');
	} catch (e) {
		// IE does not support `new Event()`
		createEvent = function createEvent(name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}

	function assign(ta) {
		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

		var heightOffset = null;
		var clientWidth = ta.clientWidth;
		var cachedHeight = null;

		function init() {
			var style = window.getComputedStyle(ta, null);

			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}

			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			// Fix when a textarea is not on document body and heightOffset is Not a Number
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}

			update();
		}

		function changeOverflow(value) {
			{
				// Chrome/Safari-specific fix:
				// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
				// made available by removing the scrollbar. The following forces the necessary text reflow.
				var width = ta.style.width;
				ta.style.width = '0px';
				// Force reflow:
				/* jshint ignore:start */
				ta.offsetWidth;
				/* jshint ignore:end */
				ta.style.width = width;
			}

			ta.style.overflowY = value;
		}

		function getParentOverflows(el) {
			var arr = [];

			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop
					});
				}
				el = el.parentNode;
			}

			return arr;
		}

		function resize() {
			var originalHeight = ta.style.height;
			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

			ta.style.height = '';

			var endHeight = ta.scrollHeight + heightOffset;

			if (ta.scrollHeight === 0) {
				// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
				ta.style.height = originalHeight;
				return;
			}

			ta.style.height = endHeight + 'px';

			// used to check if an update is actually necessary on window.resize
			clientWidth = ta.clientWidth;

			// prevents scroll-position jumping
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});

			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}

		function update() {
			resize();

			var styleHeight = Math.round(parseFloat(ta.style.height));
			var computed = window.getComputedStyle(ta, null);

			// Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
			var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

			// The actual height not matching the style height (set via the resize method) indicates that
			// the max-height has been exceeded, in which case the overflow should be allowed.
			if (actualHeight !== styleHeight) {
				if (computed.overflowY === 'hidden') {
					changeOverflow('scroll');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			} else {
				// Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
				if (computed.overflowY !== 'hidden') {
					changeOverflow('hidden');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			}

			if (cachedHeight !== actualHeight) {
				cachedHeight = actualHeight;
				var evt = createEvent('autosize:resized');
				try {
					ta.dispatchEvent(evt);
				} catch (err) {
					// Firefox will throw an error on dispatchEvent for a detached element
					// https://bugzilla.mozilla.org/show_bug.cgi?id=889376
				}
			}
		}

		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};

		var destroy = function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);

			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});

			map['delete'](ta);
		}.bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap
		});

		ta.addEventListener('autosize:destroy', destroy, false);

		// IE9 does not fire onpropertychange or oninput for deletions,
		// so binding to onkeyup to catch most of those events.
		// There is no way that I know of to detect something like 'cut' in IE9.
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}

		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';

		map.set(ta, {
			destroy: destroy,
			update: update
		});

		init();
	}

	function destroy(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.destroy();
		}
	}

	function update(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.update();
		}
	}

	var autosize = null;

	// Do nothing in Node.js environment and IE8 (or lower)
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function autosize(el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function autosize(el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}

	module.exports = autosize;
});
'use strict';

/* global window, document */

(function ifee(window) {
  var _arguments = arguments,
      _this = this;

  var fetch = function fetch(url) {
    return new Promise(function (resolve, reject) {
      var xhrequest = new XMLHttpRequest();
      xhrequest.open('GET', url, true);
      xhrequest.responseType = 'json';
      xhrequest.send();

      xhrequest.addEventListener("load", function (e) {
        return resolve(e.target.response);
      });
      xhrequest.addEventListener("error", function (e) {
        return reject(e);
      });
    });
  };

  var inputFocus = function inputFocus(e) {
    e.stopPropagation();
    var label = e.target.parentNode.querySelector('label');
    var coords = label.getBoundingClientRect();
    var offset = coords.width / 4;
    if (!label.dataset.focused || label.dataset.focused === 'false') {
      label.style = 'transform: translate(-' + offset + 'px' + ', -1em) scale(0.5); transition: transform .3s';
      label.dataset.focused = true;
    }
  };

  var inputBlur = function inputBlur(e) {
    e.stopPropagation();
    var label = e.target.parentNode.querySelector('label');
    var input = e.target.parentNode.querySelector('input');
    var textarea = e.target.parentNode.querySelector('textarea');
    var container = input || textarea;

    if (label.dataset.focused && label.dataset.focused === 'true') {
      if (!container.value) {
        label.style = 'transform: translate(0, 0) scale(1); transition: transform .3s';
        label.dataset.focused = false;
      }
    }
  };

  var contactInputAnimation = function contactInputAnimation() {
    var container = document.getElementById('contact');
    if (container) {
      container.addEventListener('focus', inputFocus, true);
      container.addEventListener('blur', inputBlur, true);
    }
  };

  var debounce = function debounce(func, wait, immediate) {
    var timeout = void 0;
    return function () {
      // var _that = this;
      var args = _arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) {
          // func.apply(_that, args);
          func.apply(_this, args);
        }
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        // func.apply(_that, args);
        func.apply(_this, args);
      }
    };
  };

  // called on document DOMContentLoaded event

  function load() {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.navbar');
    var navLinks = nav.querySelector('.nav-links');
    var nextArrow = document.querySelector('.next-arrow');
    var background = document.querySelector('.landing-page-bg');
    var i = 0;
    var j = 0;
    var scrollY = 0;
    var observer = null;

    var hamburgerClicked = function hamburgerClicked() {
      nav.classList.toggle('nav-open');
    };

    var linkClicked = function linkClicked() {
      nav.classList.remove('nav-open');
    };

    var nextArrowClicked = function nextArrowClicked(event) {
      var skill = document.getElementById('skills');
      skill.scrollIntoView();
    };

    var linkClick = function linkClick(event) {
      var id = event.target.parentNode.getAttribute('href').slice(2);
      if (id.length > 0) {
        if (window.history && window.history.pushState) {
          history.pushState('', document.title, '#' + id);
        }
      }
    };

    var scrollHandler = debounce(function cb() {
      var scrollBarPosition = window.scrollY;
      requestAnimationFrame(function () {
        if (scrollBarPosition !== 0) {
          nav.classList.add('not-top');
        } else {
          nav.classList.remove('not-top');
        }
      });
    }, 200);

    var scrollBackground = function scrollBackground() {
      background.style = 'transform: translateY(-' + scrollY + 'px)';
    };

    var backgroundScroll = function backgroundScroll(e) {
      scrollY = window.scrollY;
      requestAnimationFrame(function () {
        return scrollBackground();
      });
    };

    var getImage = function getImage(html) {
      var div = document.createElement('div');
      div.innerHTML = html;
      var img = div.querySelector('img');
      return img.src;
    };

    var loadCodepens = function loadCodepens() {
      return fetch("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D\'https%3A%2F%2Fcodepen.io%2Fkmiasko%2Fpublic%2Ffeed\'%20limit%206&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys").then(function (resp) {
        var pens = penList();
        var items = resp.query.results.item;
        for (var _i = 0, len = items.length; _i < len; _i++) {
          pens.add(penElement({
            title: items[_i].title,
            link: items[_i].link,
            image: getImage(items[_i].description).replace('large', 'small')
          }));
        }
        pens.render(document.querySelector('.last-codepens'));
      }).catch(function (error) {
        return console.log(error);
      });
    };

    var intersection = function intersection(entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio > 0) {
          observer.unobserve(entry.target);
          loadCodepens();
        }
      });
    };

    window.removeEventListener('DOMContentLoaded', load);
    window.addEventListener('scroll', scrollHandler);
    hamburger.addEventListener('click', hamburgerClicked);
    navLinks.addEventListener('click', linkClick);

    if (nextArrow) {
      nextArrow.addEventListener('click', nextArrowClicked);
      window.addEventListener('scroll', backgroundScroll);

      if (!('IntersectionObserver' in window)) {
        loadCodepens();
      } else {
        observer = new IntersectionObserver(intersection, { rootMargin: '50px 0px', threshold: 0.01 });
        var codepens = document.querySelector('.last-codepens');
        observer.observe(codepens);
      }
    }

    // load last 6 pens from my codepen using unofficial cpv2api (CORS)
    // and add them to last-code-pens section
    contactInputAnimation();

    // form textarea auto resize - plugin
    // autosize(document.querySelectorAll('textarea'));
  }

  window.addEventListener('DOMContentLoaded', load, false);
})(window);
'use strict';

var penElement = function penElement(_ref) {
  var link = _ref.link,
      image = _ref.image,
      title = _ref.title;


  var template_html = '\n  <a href="' + link + '">\n    <img src="' + image + '" alt="pen" />\n  </a>\n  <div class="pen__more"><i class="fa fa-ellipsis-v"></i></div>\n  <div class="pen__details">\n    <div class="pen__content">\n      <p class="pen__title">' + title + '</p>\n      <div class="pen__icons">\n        <p>Udost\u0119pnij</p>\n        <a href="https://www.facebook.com/sharer/sharer.php?u=' + link + '"><i class="fa fa-facebook"></i></a>\n        <a href="https://twitter.com/home?status=Pen by Krzysztof Mi\u0105sko ' + link + '"><i class="fa fa-twitter"></i></a>\n        <a href="https://plus.google.com/share?url=' + link + '"><i class="fa fa-google-plus"></i></a>\n      </div>\n    </div>\n  </div>\n  </div>';

  var container = document.createElement('div');
  var template = null;
  var openButton = null;
  var detailsPopup = null;

  function _init() {
    container.classList.add('pen');
  }

  function _create() {
    container.innerHTML = template_html;
    openButton = container.querySelector('.pen__more');
    detailsPopup = container.querySelector('.pen__details');
  }

  function _bindEvents() {
    openButton.addEventListener('click', _openContainer);
    detailsPopup.addEventListener('mouseleave', _closeContainer);
  }

  function _closeContainer(event) {
    detailsPopup.classList.remove('pen__details--open');
  }

  function _openContainer(event) {
    detailsPopup.classList.toggle('pen__details--open');
  }

  _init();
  _create();
  _bindEvents();

  return container;
};

var penList = function penList() {
  var pens = [];
  var container = document.createDocumentFragment();
  var add = function add(pen) {
    return pens.push(pen);
  };
  var render = function render(parent) {
    pens.forEach(function (pen) {
      return container.appendChild(pen);
    });
    parent.appendChild(container);
  };

  return {
    add: add,
    render: render
  };
};