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
      return fetch(`https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'https%3A%2F%2Fcodepen.io%2Fkmiasko%2Fpublic%2Ffeed'%20limit%206&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`).then(function (resp) {
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

    var resizeTextarea = function resizeTextarea(element) {
      var observe = void 0;
      if (window.attachEvent) {
        observe = function observe(element, event, handler) {
          element.attachEvent('on' + event, handler);
        };
      } else {
        observe = function observe(element, event, handler) {
          element.addEventListener(event, handler, false);
        };
      }

      function resize() {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 26 + 'px';
      }

      function delayedResize() {
        window.setTimeout(resize, 0);
      }

      observe(element, 'change', resize);
      observe(element, 'cut', delayedResize);
      observe(element, 'paste', delayedResize);
      observe(element, 'drop', delayedResize);
      observe(element, 'keydown', delayedResize);

      // element.focus();
      // element.select();
      resize();
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
    resizeTextarea(document.querySelector('textarea'));
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
