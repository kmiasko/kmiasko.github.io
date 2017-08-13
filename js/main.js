/* global autosize, Handlebars, fetch, window, document */

(function ifee(window, fetch) {
  'use strict';

  function inputFocus(e) {
    e.stopPropagation();
    var label = e.target.parentNode.querySelector('label');
    var coords = label.getBoundingClientRect();
    var offset = coords.width / 4;
    if (!label.dataset.focused || label.dataset.focused === 'false') {
      label.style = 'transform: translate(-' + offset + 'px' + ', -1em) scale(0.5); transition: transform .3s';
      label.dataset.focused = true;
    }
  }

  function inputBlur(e) {
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
  }

  function contactInputAnimation() {
    var container = document.getElementById('contact');
    container.addEventListener('focus', inputFocus, true);
    container.addEventListener('blur', inputBlur, true);
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function anon() {
      var _that = this;
      var args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) {
          func.apply(_that, args);
        }
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(_that, args);
      }
    };
  }

  // called on document DOMContentLoaded event

  function load() {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.navbar');
    var linksList = nav.querySelectorAll('.nav-link');
    var nextArrow = document.querySelector('.next-arrow');
    var links = document.querySelectorAll('a[href^="/#"]');
    var pens;
    var i = 0;
    var j = 0;
    // var scrolling = false;

    var hamburgerClicked = function hc() {
      nav.classList.toggle('nav-open');
    };

    var linkClicked = function lc() {
      nav.classList.remove('nav-open');
    };

    var nextArrowClicked = function nac(event) {
      var skill = document.getElementById('skills');
      skill.scrollIntoView();
      // event.preventDefault();
      // controller.scrollTo(skill.offsetTop);
    };

    var linkClick = function lcc(event) {
      var id = this.getAttribute('href').slice(2);
      if (id.length > 0) {
        // event.preventDefault();
        if (window.history && window.history.pushState) {
          history.pushState('', document.title, '#' + id);
        }
      }
    };

    var scrollHandler = debounce(function cb() {
      var scrollBarPosition = window.scrollY;
      requestAnimationFrame(function() {
        if (scrollBarPosition !== 0) {
          nav.classList.add('not-top');
        } else {
          nav.classList.remove('not-top');
        }
      });
    }, 200);

    window.removeEventListener('DOMContentLoaded', load, false);
    window.addEventListener('scroll', scrollHandler);
    hamburger.addEventListener('click', hamburgerClicked, false);
    nextArrow.addEventListener('click', nextArrowClicked, false);

    for (i = 0; i < linksList.length; i += 1) {
      linksList[i].addEventListener('click', linkClicked, false);
    }

    if (window.location.pathname === '/') {
      for (j = 0; j < links.length; j += 1) {
        links[j].addEventListener('click', linkClick, false);
      }
    }

    // load last 6 pens from my codepen using unofficial cpv2api (CORS)
    // and add them to last-code-pens section
    pens = penList();
    fetch('http://cpv2api.com/pens/public/kmiasko')
      .then(function(response) { return response.json(); })
      .then(function(resp) {
        for (var i = 0; i < resp.data.length; i++) {
          pens.add(penElement({
            title: resp.data[i].title,
            link: resp.data[i].link,
            image: resp.data[i].images.small
          }));
        }
        pens.render(document.querySelector('.last-codepens'));
      });

    contactInputAnimation();

    // form textarea auto resize - plugin
    autosize(document.querySelectorAll('textarea'));
  }

  window.addEventListener('DOMContentLoaded', load, false);
}(window, window.fetch));
