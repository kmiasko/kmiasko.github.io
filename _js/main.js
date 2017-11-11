/* global window, document */


(function ifee(window) {
  const fetch = (url) => new Promise((resolve, reject) => {
    const xhrequest = new XMLHttpRequest();
    xhrequest.open('GET', url, true);
    xhrequest.responseType = 'json';
    xhrequest.send();

    xhrequest.addEventListener("load", (e) =>  resolve(e.target.response));
    xhrequest.addEventListener("error", (e) => reject(e));
  });

  const inputFocus = (e) => {
    e.stopPropagation();
    var label = e.target.parentNode.querySelector('label');
    var coords = label.getBoundingClientRect();
    var offset = coords.width / 4;
    if (!label.dataset.focused || label.dataset.focused === 'false') {
      label.style = 'transform: translate(-' + offset + 'px' + ', -1em) scale(0.5); transition: transform .3s';
      label.dataset.focused = true;
    }
  }

  const inputBlur = (e) => {
    e.stopPropagation();
    const label = e.target.parentNode.querySelector('label');
    const input = e.target.parentNode.querySelector('input');
    const textarea = e.target.parentNode.querySelector('textarea');
    const container = input || textarea;

    if (label.dataset.focused && label.dataset.focused === 'true') {
      if (!container.value) {
        label.style = 'transform: translate(0, 0) scale(1); transition: transform .3s';
        label.dataset.focused = false;
      }
    }
  }

  const contactInputAnimation = () => {
    const container = document.getElementById('contact');
    if (container) {
      container.addEventListener('focus', inputFocus, true);
      container.addEventListener('blur', inputBlur, true);
    }
  }

  const debounce = (func, wait, immediate) => {
    let timeout;
    return () => {
      // var _that = this;
      const args = arguments;
      const later = () => {
        timeout = null;
        if (!immediate) {
          // func.apply(_that, args);
          func.apply(this, args);
        }
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        // func.apply(_that, args);
        func.apply(this, args);
      }
    };
  }

  // called on document DOMContentLoaded event

  function load() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.navbar');
    const navLinks = nav.querySelector('.nav-links');
    const nextArrow = document.querySelector('.next-arrow');
    const background = document.querySelector('.landing-page-bg');
    var i = 0;
    var j = 0;
    let scrollY = 0;
    let observer = null;


    const hamburgerClicked = () => {
      nav.classList.toggle('nav-open');
    };

    const linkClicked = () => {
      nav.classList.remove('nav-open');
    };

    const nextArrowClicked = (event) => {
      const skill = document.getElementById('skills');
      skill.scrollIntoView();
    };

    const linkClick = function(event) {
      const id = event.target.parentNode.getAttribute('href').slice(2);
      if (id.length > 0) {
        if (window.history && window.history.pushState) {
          history.pushState('', document.title, '#' + id);
        }
      }
    };

    const scrollHandler = debounce(function cb() {
      const scrollBarPosition = window.scrollY;
      requestAnimationFrame(function() {
        if (scrollBarPosition !== 0) {
          nav.classList.add('not-top');
        } else {
          nav.classList.remove('not-top');
        }
      });
    }, 200);

    const scrollBackground = () => {
      background.style = `transform: translateY(-${scrollY}px)`;
    }

    const backgroundScroll = (e) => {
      scrollY = window.scrollY;
      requestAnimationFrame(() => scrollBackground());
    };

    const getImage = (html) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      const img = div.querySelector('img');
      return img.src;
    }

    const loadCodepens = () =>
      fetch("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D\'https%3A%2F%2Fcodepen.io%2Fkmiasko%2Fpublic%2Ffeed\'%20limit%206&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys")
        .then((resp) => {
          const pens = penList();
          const items = resp.query.results.item;
          for (let i = 0, len = items.length; i < len; i++) {
            pens.add(penElement({
              title: items[i].title,
              link: items[i].link,
              image: getImage(items[i].description).replace('large', 'small'),
            }));
          }
          pens.render(document.querySelector('.last-codepens'));
        })
        .catch(error => console.log(error));

    const intersection = (entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          observer.unobserve(entry.target);
          loadCodepens();
        }
      });
    };

    const resizeTextarea = (element) => {
      let observe;
      if (window.attachEvent) {
        observe = function (element, event, handler) {
          element.attachEvent('on'+event, handler);
        };
      }
      else {
        observe = function (element, event, handler) {
          element.addEventListener(event, handler, false);
        };
      }

      function resize () {
        element.style.height = 'auto';
        element.style.height = (element.scrollHeight+25)+'px';
      }

      function delayedResize () {
        window.setTimeout(resize, 0);
      }

      observe(element, 'change',  resize);
      observe(element, 'cut',     delayedResize);
      observe(element, 'paste',   delayedResize);
      observe(element, 'drop',    delayedResize);
      observe(element, 'keydown', delayedResize);

      // element.focus();
      // element.select();
      resize();
    }

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
        const codepens = document.querySelector('.last-codepens');
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
}(window));

