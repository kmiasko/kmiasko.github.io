var penElement = (function(_penDetails) {

  var template_html = '' +
  '<a href="{{link}}">' +
    '<img src="{{image}}" alt="pen" />' +
  '</a>' +
  '<div class="pen__more"><i class="fa fa-ellipsis-v"></i></div>' +
  '<div class="pen__details">' +
    '<div class="pen__content">' +
      '<p class="pen__title">{{title}}</p>' +
      '<div class="pen__icons">' +
        '<p>Udostępnij</p>' +
        '<a href="https://www.facebook.com/sharer/sharer.php?u={{link}}"><i class="fa fa-facebook"></i></a>' +
        '<a href="https://twitter.com/home?status=Pen by Krzysztof Miąsko {{link}}"><i class="fa fa-twitter"></i></a>' +
        '<a href="https://plus.google.com/share?url={{link}}"><i class="fa fa-google-plus"></i></a>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '</div>';

  var template,
    container,
    penDetails = {},
    $openButton,
    $detailsPopup;

  function _init() {
    template = Handlebars.compile(template_html);
    container = document.createElement('div');
    container.classList.add('pen');
  }

  function _create() {
    $.extend(penDetails, _penDetails);
    container.innerHTML = template(penDetails);
    $openButton = $(container).find('.pen__more');
    $detailsPopup = $(container).find('.pen__details');
  }

  function _bindEvents() {
    $openButton.on('click', _openContainer);
    $detailsPopup.on('mouseleave', _closeContainer);
  }

  function _closeContainer(event) {
    $detailsPopup.removeClass('pen__details--open');
  }

  function _openContainer(event) {
    $detailsPopup.toggleClass('pen__details--open');
  }

  _init();
  _create();
  _bindEvents();

  return container;
});

var penList = (function() {
  var pens = [];
  var container = document.createDocumentFragment();

  function add(pen) {
    pens.push(pen);
  }

  function render(parent) {
    pens.forEach(function(pen) {
      container.appendChild(pen);
    });
    parent.appendChild(container);
  }

  return {
    add: add,
    render: render
  };
});
