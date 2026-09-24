$(function () {
  // ヘッダーをスクロール時に変化
  const $header = $(".header");
  $(window).on("scroll", function () {
    $header.toggleClass("scrolled", $(this).scrollTop() > 30);
  });

  // スマホメニュー
  $(".menu-toggle").on("click", function () {
    $(".nav").toggleClass("open");
  });

  $(".nav a").on("click", function () {
    $(".nav").removeClass("open");
  });

  // スムーススクロール
  $('a[href^="#"]').on("click", function (e) {
    const target = $(this).attr("href");
    if (target !== "#" && $(target).length) {
      e.preventDefault();
      $("html, body").animate({
        scrollTop: $(target).offset().top - 65
      }, 650);
    }
  });

  // ==============================
  // サンプル音源プレイヤー
  // ==============================

  const audioSources = {
    daze: "audio/daze.mp3",
    harohawayu: "audio/harohawayu.mp3"
  };

  const audioSettings = {
    daze: {
      start: 0,
      end: null
    },

    harohawayu: {
      start: 93.3,
      end: 137
    }
  };

  let currentAudio = null;
  let currentButton = null;
  let currentFadeTimer = null;


  // 音源を停止してUIを戻す
  function stopCurrentAudio() {
    if (currentFadeTimer) {
      cancelAnimationFrame(currentFadeTimer);
      currentFadeTimer = null;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.volume = 1;
    }

    if (currentButton) {
      currentButton.removeClass("is-playing");
      currentButton.find(".play-icon").text("▶");

      currentButton.contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .last()[0].textContent = " SAMPLE PLAY";
    }

    currentAudio = null;
    currentButton = null;
  }


  // 音源再生
  $(".audio-button").on("click", function () {

    const $button = $(this);
    const audioName = $button.data("audio");

    // 現在再生中の音源をクリックした場合 → 停止
    if (currentButton && currentButton[0] === $button[0]) {
      stopCurrentAudio();
      return;
    }

    // 他の音源が鳴っていたら停止
    stopCurrentAudio();

    // 仮置きのsample01はまだ再生しない
    if (!audioSources[audioName]) {
      console.log("このサンプル音源はまだ未設定です。");
      return;
    }

    const settings = audioSettings[audioName];

    const audio = new Audio(audioSources[audioName]);

    audio.preload = "auto";
    audio.volume = 0;

    currentAudio = audio;
    currentButton = $button;

    // UI変更
    $button.addClass("is-playing");
    $button.find(".play-icon").text("■");

    $button.contents()
      .filter(function () {
        return this.nodeType === 3;
      })
      .last()[0].textContent = " SAMPLE PLAYING";


    // 再生開始
    audio.addEventListener("loadedmetadata", function () {

      const startTime = settings.start;
      const endTime = settings.end !== null
        ? settings.end
        : audio.duration;

      audio.currentTime = startTime;

      audio.play().catch(function (error) {
        console.error("音源を再生できませんでした:", error);
        stopCurrentAudio();
      });


      // ==========================
      // フェード処理
      // ==========================

      const fadeDuration = 1;

      function updateFade() {

        if (!currentAudio || currentAudio !== audio) {
          return;
        }

        const currentTime = audio.currentTime;


        // ---- フェードイン ----

        if (currentTime < startTime + fadeDuration) {

          const progress =
            (currentTime - startTime) / fadeDuration;

          audio.volume = Math.max(
            0,
            Math.min(1, progress)
          );

        }


        // ---- 通常再生 ----

        else if (currentTime < endTime - fadeDuration) {

          audio.volume = 1;

        }


        // ---- フェードアウト ----

        else {

          const progress =
            (endTime - currentTime) / fadeDuration;

          audio.volume = Math.max(
            0,
            Math.min(1, progress)
          );
        }


        // ---- 再生終了 ----

        if (currentTime >= endTime) {

          audio.pause();
          audio.currentTime = startTime;

          stopCurrentAudio();
          return;
        }

        currentFadeTimer =
          requestAnimationFrame(updateFade);
      }

      currentFadeTimer =
        requestAnimationFrame(updateFade);

    });
  });

  // FAQ開閉時に軽くスクロール位置を補正
  $(".faq-list details").on("toggle", function () {
    if (this.open) {
      $(this).hide().fadeIn(180);
    }
  });

  // セクションを表示したときのフェードイン
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $(entry.target).addClass("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  $(".section, .cta-section").each(function () {
    $(this).addClass("fade-target");
    observer.observe(this);
  });
});

(() => {
  const field = document.querySelector('.hero-stars');
  if (!field) return;

  const STAR_COUNT = 120;
  const stars = [];

  const random = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  let viewportWidth = window.innerWidth;

  // 星を生成
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement('span');

    star.className = 'star';

    // 大きさ
    const size = random(1, 3);

    // 色味を少しずつ変える
    const colors = [
      'rgba(255, 243, 234, 0.9)',
      'rgba(229, 236, 254, 0.8)',
      'rgba(253, 235, 235, 0.85)',
      'rgba(255, 250, 229, 0.65)'
    ];

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    // 星の初期位置をpxで保存
    const baseX = random(0, viewportWidth);
    const baseY = random(0, 100);

    star.style.left = `${baseX}px`;
    star.style.top = `${baseY}%`;

    // 星ごとに少し違う透明度
    star.style.opacity = random(0.35, 1);

    // 星ごとに少し違う移動速度
    const speed = random(0.04, 0.12);

    stars.push({
      element: star,
      baseX,
      speed
    });

    field.appendChild(star);
  }

  // スクロールに合わせて星を右→左へ流す
  const updateStars = () => {
    const scrollY = window.scrollY;

    stars.forEach(({ element, baseX, speed }) => {
      // スクロールに応じて左へ移動
      let currentX = baseX - (scrollY * speed);

      // 左端から消えたら右端から再出現
      currentX =
        ((currentX % viewportWidth) + viewportWidth) % viewportWidth;

      // 元の位置との差分だけtransformする
      const moveX = currentX - baseX;

      element.style.transform = `translateX(${moveX}px)`;
    });
  };

  // ウィンドウサイズ変更にも対応
  window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth;
    updateStars();
  });

  window.addEventListener('scroll', updateStars, {
    passive: true
  });

  updateStars();
})();