function markAsComplete($el) {
  var id = $el.getAttribute('data-mark-as-complete');
  var modal = document.getElementById(id);
  var $modal = document.createElement('div');
  $modal.classList.add('c-modal');
  var $modalContainer = document.createElement('div');
  $modalContainer.classList.add('c-modal__inner');
  var $modalClose = document.createElement('div');
  $modalClose.classList.add('c-modal__close');
  $modalClose.innerHtml = '<span class="fa fa-close" aria-hidden="true"></span>';
  $modal.appendChild($modalContainer);
  $modalContainer.appendChild($modalClose);
  $modalContainer.appendChild(modal);
  document.body.appendChild($modal);
  $el.addEventListener('click', function (e) {
    e.preventDefault();
    $modal.classList.add('c-modal--open');
  });
  $modalClose.addEventListener('click', function () {
    $modal.classList.remove('c-modal--open');
  });
  $modal.addEventListener('click', function (e) {
    if (e.target === $modal) {
      $modal.classList.remove('c-modal--open');
    }
  });
}

// DOM ready
document.addEventListener('DOMContentLoaded', function () {
  var $markAs = document.querySelector('[data-mark-as-complete]');
  if ($markAs) {
    markAsComplete($markAs);
  }
});
