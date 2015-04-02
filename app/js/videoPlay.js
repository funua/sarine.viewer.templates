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

    videoElement.addEventListener('ended', showBtn);
    videoElement.addEventListener('pause', showBtn);
    videoElement.addEventListener('canplay', function () {
      if (forceReloaded) {
        forceReloaded = false;
        startPlaying();
      }
    });
    videoElement.addEventListener('play', function () {
      hideBtn();
    });

    btn.addEventListener('click', function () {
      if (videoElement.readyState < 3) {
        videoElement.src = videoElement.getAttribute('data-src');
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