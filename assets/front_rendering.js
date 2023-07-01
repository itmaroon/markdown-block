
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

});