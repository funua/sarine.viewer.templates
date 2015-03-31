(function (window, document) {
  'use strict';

  var videoPlay = {
    initButton: initButton
  };

  window.videoPlay = videoPlay;

  function initButton(btn) {
    var videoId = btn.getAttribute('data-video-id'),
        videoElement = document.getElementById(videoId || '');

    if (!videoElement) {
      return;
    }

    videoElement.addEventListener('ended', showBtn);
    videoElement.addEventListener('pause', showBtn);
    videoElement.addEventListener('play', function () {
      //btn.style.display = 'none';
      btn.setAttribute('data-hidden', true);
    });

    btn.addEventListener('click', function () {
      videoElement.play();
      btn.setAttribute('data-hidden', true);
    });

    function showBtn() {
      btn.removeAttribute('data-hidden');
      //btn.style.display = '';
    }
  }
})(window, window.document);