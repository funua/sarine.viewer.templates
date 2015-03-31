(function (window, document) {
  'use strict';

  var videoPlay = {
    initButton: initButton
  };

  window.videoPlay = videoPlay;

  function initButton(btn) {
    var videoId = btn.getAttribute('data-video-id'),
        videoElement = document.getElementById(videoId || ''),
        forceReloaded = false;

    if (!videoElement) {
      return;
    }

    videoElement.load();

    videoElement.addEventListener('ended', showBtn);
    videoElement.addEventListener('pause', showBtn);
    videoElement.addEventListener('canplay', function () {
      if (forceReloaded) {
        startPlaying();
      }
    });
    videoElement.addEventListener('play', function () {
      hideBtn();
    });

    btn.addEventListener('click', function () {
      if (videoElement.readyState < 3) {
        videoElement.load();
        forceReloaded = true;
      } else {
        startPlaying();
      }
    });

    function showBtn() {
      btn.style.display = '';
    }

    function hideBtn() {
      btn.style.display = 'none';
    }

    function startPlaying() {
      videoElement.play();
      hideBtn();
    }
  }
})(window, window.document);