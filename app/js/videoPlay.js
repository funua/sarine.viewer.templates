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

    videoElement.load();

    videoElement.addEventListener('ended', showBtn);
    videoElement.addEventListener('pause', showBtn);
    videoElement.addEventListener('play', function () {
      hideBtn();
    });

    btn.addEventListener('click', function () {
      videoElement.play();
      hideBtn();
    });

    function showBtn() {
      btn.style.display = '';
    }

    function hideBtn() {
      btn.style.display = 'none';
    }
  }
})(window, window.document);