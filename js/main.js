/* global ScrollMagic, jQuery, TweenLite, window, document */

(function ifee(window, $) {
  'use strict';

  function debounce(func, wait, immediate) {
    var timeout;
    return function anon() {
      var that = this;
      var args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) {
          func.apply(that, args);
        }
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(that, args);
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
    var yql = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html(6)%20where%20url%3D%22http%3A%2F%2Fcodepen.io%2Fkmiasko%2Fpublic%2Ffeed%2F%22%20and%20xpath%3D%22%2F%2Fitem%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
    var codepens = document.querySelectorAll('.pen');
    var controller = new ScrollMagic.Controller({ duration: duration });
    var controller2 = new ScrollMagic.Controller();

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

    $.ajax(yql, {
      dataType: 'jsonp'
    }).done(function jcb(data) {
      var link;
      var image;
      var title;
      var penDate;
      var z;
      for (z = 0; z < codepens.length; z += 1) {
        link = codepens[z].querySelector('.pen-image a');
        image = codepens[z].querySelector('.pen-image a img');
        title = codepens[z].querySelector('h3 a');
        penDate = codepens[z].querySelector('.pen-date');
        link.href = data.query.results.item[z].guid.replace(/\/pen\//, '/full/');
        image.src = data.query.results.item[z].description.a.img.src;
        title.textContent = data.query.results.item[z].subject;
        title.href = data.query.results.item[z].guid;
        penDate.textContent = data.query.results.item[z].date.split('T')[0];
      }
    });
  }
  window.addEventListener('load', load, false);
}(window, jQuery));
