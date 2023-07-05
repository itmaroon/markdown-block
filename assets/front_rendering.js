
jQuery(function ($) {
  let headerHeight = 0;

  //ページ内スムーススクロール
  $('a[href^="#"]').click(function () {
    let speed = 500;
    let id = $(this).attr("href");
    let target = $("#" === id ? "html" : id);
    let position = $(target).offset().top - (headerHeight + 50);
    $('body,html').animate({ scrollTop: position }, speed);
  });

  //tocのアコーデオン
  let speed = 300;
  $('.btn_open').click(function () {
    const list = $(this).parent().next();
    if ($(this).hasClass('is_open')) {
      list.slideUp(speed);
    } else {
      list.slideDown(speed);
    }

    $(this).toggleClass("is_open");
  });

  //タイトル要素が可視領域に入った時の処理
  function findTopElement() {
    var fromTop = $(window).scrollTop();
    var toBottom = $(window).scrollTop() + $(window).height();
    var tocElements = $('*[id^="toc-"]');

    var visibleElements = tocElements.filter(function () {
      var elementTop = $(this).offset().top;
      var elementBottom = elementTop + $(this).outerHeight();
      return elementTop >= fromTop && elementBottom <= toBottom;
    });

    var topElement = visibleElements.first();

    if (topElement.length) {
      var elementId = topElement.attr('id');
      var anchorElement = $('.sidebar a[href="#' + elementId + '"]').parents('li');

      $('.sidebar li').removeClass('checked check_prev check_next');
      anchorElement.addClass('checked ready')
      anchorElement.prevAll('li').addClass('check_prev');
      anchorElement.nextAll('li').addClass('check_next');

    } else {
      console.log("No visible element found");
    }
  }

  $(document).ready(findTopElement);
  $(window).on('scroll', findTopElement);

});