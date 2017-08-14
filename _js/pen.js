const penElement = (function({ link, image, title }) {

  const template_html = `
  <a href="${link}">
    <img src="${image}" alt="pen" />
  </a>
  <div class="pen__more"><i class="fa fa-ellipsis-v"></i></div>
  <div class="pen__details">
    <div class="pen__content">
      <p class="pen__title">${title}</p>
      <div class="pen__icons">
        <p>Udostępnij</p>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${link}"><i class="fa fa-facebook"></i></a>
        <a href="https://twitter.com/home?status=Pen by Krzysztof Miąsko ${link}"><i class="fa fa-twitter"></i></a>
        <a href="https://plus.google.com/share?url=${link}"><i class="fa fa-google-plus"></i></a>
      </div>
    </div>
  </div>
  </div>`;

  const container = document.createElement('div');
  let template = null;
  let openButton = null;
  let detailsPopup = null;

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
});

var penList = (function() {
  const pens = [];
  const container = document.createDocumentFragment();
  const add = (pen) => pens.push(pen);
  const render = (parent) => {
    pens.forEach((pen) => container.appendChild(pen));
    parent.appendChild(container);
  }

  return {
    add: add,
    render: render
  };
});

