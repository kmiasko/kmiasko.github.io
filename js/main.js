/* global autosize, Handlebars, ScrollMagic, jQuery, TweenLite, window, document */

(function ifee(window, $) {
  'use strict';

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

  function getDocumentHeight() {
    return Math.max(
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
      Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    );
  }

  function load() {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.navbar');
    var duration = getDocumentHeight() + window.innerHeight;
    var linksList = nav.querySelectorAll('.nav-link');
    var nextArrow = document.querySelector('.next-arrow');
    var backToTop = document.querySelector('.triangle-up');
    var i = 0;
    var j = 0;
    var links = document.querySelectorAll('a[href^="/#"]');
    var controller = new ScrollMagic.Controller({ duration: duration });
    var controller2 = new ScrollMagic.Controller();
    var penTemplateSource = document.querySelector('#pen-template').innerHTML;
    var penTarget = document.querySelector('.last-codepens');
    var penPlaceholder = '<header class="codepens-header"><h2>Codepen</h2></header>\n';
    var pens;
    var template = Handlebars.compile(penTemplateSource);
    var infoContainerToggleClass = 'pen__details--open';

    var hamburgerClicked = function hc() {
      nav.classList.toggle('nav-open');
    };

    var linkClicked = function lc() {
      nav.classList.remove('nav-open');
    };

    var nextArrowClicked = function nac(event) {
      var skill = document.getElementById('skills');
      event.preventDefault();
      controller2.scrollTo(skill.offsetTop);
    };

    var linkClick = function lcc(event) {
      var id = this.getAttribute('href').slice(2);
      if (id.length > 0) {
        event.preventDefault();
        controller2.scrollTo(document.getElementById(id).offsetTop);

        if (window.history && window.history.pushState) {
          history.pushState('', document.title, '#' + id);
        }
      }
    };

    var backToTopClicked = function bttc() {
      controller2.scrollTo(nav.offsetTop);
    };

    var scrollHandler = debounce(function cb() {
      var scrollBarPosition = (window.pageYOffset || document.body.scrollTop);
      if (scrollBarPosition !== 0) {
        nav.classList.add('not-top');
      } else {
        nav.classList.remove('not-top');
      }
    }, 250);

    autosize(document.querySelectorAll('textarea'));

    controller2.scrollTo(function cb2(newpos) {
      TweenLite.to(window, 1, { scrollTo: { y: newpos } });
    });

    window.removeEventListener('load', load, false);
    window.addEventListener('scroll', scrollHandler);
    hamburger.addEventListener('click', hamburgerClicked, false);
    if (nextArrow) nextArrow.addEventListener('click', nextArrowClicked, false);
    backToTop.addEventListener('click', backToTopClicked, false);

    for (i = 0; i < linksList.length; i += 1) {
      linksList[i].addEventListener('click', linkClicked, false);
    }

    new ScrollMagic.Scene({ triggerElement: '#skills' })
      .setClassToggle('.navbar', 'darken')
      .addTo(controller);

    if (window.location.pathname === '/') {
      for (j = 0; j < links.length; j += 1) {
        links[j].addEventListener('click', linkClick, false);
      }
    }

    function infoState(e) {
      var el = e.currentTarget.parentNode.querySelector('.pen__details');
      el.classList.toggle(infoContainerToggleClass);
    }

    function removeState(e) {
      if (e.target.classList.contains(infoContainerToggleClass)) {
        e.target.classList.remove(infoContainerToggleClass);
      }
    }

    function addEventHandlers(elemList) {
      var el;
      for (i = 0; i < elemList.length; i++) {
        el = elemList[i].querySelector('.pen__more');
        el.addEventListener('click', infoState);
        elemList[i].querySelector('.pen__details').addEventListener('mouseleave', removeState);
      }
    }

    $.getJSON('http://cpv2api.com/pens/public/kmiasko')
      .done(function apiResp(resp) {
        if (resp.success) {
          for (i = 0; i < resp.data.length; i++) {
            penPlaceholder += template({
              title: resp.data[i].title,
              link: resp.data[i].link,
              image: resp.data[i].images.small
            }) + '\n';
          }
          penTarget.innerHTML = penPlaceholder;
        }
      }).always(function jsxComp() {
        pens = penTarget.querySelectorAll('.pen');
        addEventHandlers(pens);
      });
  }

  window.addEventListener('load', load, false);
}(window, jQuery));
