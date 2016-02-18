/* global ScrollMagic, jQuery, TweenLite, window, document */

(function (window, $) {
  'use strict';

  window.addEventListener('load', load, false);

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
    var links = document.querySelectorAll('a[href^="#"]');
    var yql = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html(6)%20where%20url%3D%22http%3A%2F%2Fcodepen.io%2Fkmiasko%2Fpublic%2Ffeed%2F%22%20and%20xpath%3D%22%2F%2Fitem%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
    var codepens = document.querySelectorAll('.pen');

    var controller = new ScrollMagic.Controller({ duration: duration });
    var controller2 = new ScrollMagic.Controller();

    var hamburgerClicked = function () {
      nav.classList.toggle('nav-open');
    };

    var linkClicked = function () {
      nav.classList.remove('nav-open');
    };

    var nextArrowClicked = function (event) {
      var skill = document.getElementById('skills');
      event.preventDefault();
      controller2.scrollTo(skill.offsetTop);
    };

    var linkClick = function (event) {
      var id = this.getAttribute('href').slice(1);
      if (id.length > 0) {
        event.preventDefault();
        controller2.scrollTo(document.getElementById(id).offsetTop);

        if (window.history && window.history.pushState) {
          history.pushState('', document.title, '#' + id);
        }
      }
    };

    var backToTopClicked = function () {
      controller2.scrollTo(nav.offsetTop);
    };

    controller2.scrollTo(function (newpos) {
      TweenLite.to(window, 1, { scrollTo: { y: newpos } });
    });

    window.removeEventListener('load', load, false);
    hamburger.addEventListener('click', hamburgerClicked, false);
    nextArrow.addEventListener('click', nextArrowClicked, false);
    backToTop.addEventListener('click', backToTopClicked, false);

    for (i = 0; i < linksList.length; i += 1) {
      linksList[i].addEventListener('click', linkClicked, false);
    }

    new ScrollMagic.Scene({ triggerElement: '#skills' })
    .setClassToggle('.navbar', 'darken')
    .addTo(controller);

    for (j = 0; j < links.length; j += 1) {
      links[j].addEventListener('click', linkClick, false);
    }

    $.ajax(yql, {
      dataType: 'jsonp'
    }).done(function(data) {
      for(var z = 0; z < codepens.length; z += 1) {
        var link = codepens[z].querySelector('.pen-image a');
        var image = codepens[z].querySelector('.pen-image a img');
        var title = codepens[z].querySelector('h3 a');
        var desc = codepens[z].querySelector('p');
        var penDate = codepens[z].querySelector('.pen-date');
        link.href = data.query.results.item[z].guid;
        image.src = data.query.results.item[z].description.a.img.src;
        title.textContent = data.query.results.item[z].subject;
        title.href = data.query.results.item[z].guid;
        penDate.textContent = data.query.results.item[z].date.split('T')[0];
      }
    });
  }
})(window, jQuery);