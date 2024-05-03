jQuery(function ($) {
	let headerHeight = 0;

	//ページ内スムーススクロール
	$('a[href^="#"]').click(function () {
		let speed = 500;
		let id = $(this).attr("href");
		let target = $("#" === id ? "html" : id);
		let position = $(target).offset().top - (headerHeight + 50);
		$("body,html").animate(
			{ scrollTop: position },
			speed,
			"linear",
			function () {
				//スマホ対応のボタン類を消去
				hanberger_btn.removeClass("is-active");
				$("#itmar_mdBlock_drawer_background").removeClass("is-active");
				$(".side_md_content").removeClass("is-active");
			},
		);
	});

	//tocのアコーデオン
	let speed = 300;
	$(".btn_open").click(function () {
		const list = $(this).parent().next();
		if ($(this).hasClass("is_open")) {
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
			var elementId = topElement.attr("id");
			var anchorElement = $(
				'.md_toc_sidebar a[href="#' + elementId + '"]',
			).parents("li");

			$(".md_toc_sidebar li").removeClass("checked check_prev check_next"); //全ての要素からクラスを外す
			anchorElement.addClass("checked ready"); //チェックされた要素
			anchorElement.prevAll("li").addClass("check_prev"); //それより前の要素
			anchorElement.nextAll("li").addClass("check_next"); //それより後の要素

			var $parent = anchorElement.closest("ul"); //anchorElementの親要素（ul）を取得
			// anchorElementと親要素の各辺の位置を取得
			var anchorTop = anchorElement.offset().top;
			var anchorBottom = anchorTop + anchorElement.outerHeight();
			var parentTop = $parent.offset().top;
			var parentBottom = parentTop + $parent.innerHeight();

			// ターゲット要素が親要素の表示範囲をオーバーフローしているかを検査
			if (anchorTop < parentTop || anchorBottom > parentBottom) {
				//オーバーフローしていればスクロール
				$parent.animate({ scrollTop: anchorElement.position().top }, 500);
			}
		}
	}

	$(document).ready(findTopElement);
	$(window).on("scroll", findTopElement);

	//ドロワーボタン
	let hanberger_btn = $("#itmar_mdBlock_hanberger");

	$(window).scroll(function () {
		if ($("html").width() < 768) {
			//スマホの場合
			if ($(this).scrollTop() >= 500) {
				hanberger_btn.fadeIn(500);
			} else {
				if (!hanberger_btn.hasClass("is-active")) {
					hanberger_btn.fadeOut(500);
				}
			}
		} else {
			hanberger_btn.hide();
		}
	});

	hanberger_btn.click(function () {
		$(this).toggleClass("is-active");
		$(".side_md_content").toggleClass("is-active");
		$("#itmar_mdBlock_drawer_background").toggleClass("is-active");
	});

	$("#itmar_mdBlock_drawer_background").click(function (e) {
		//e.preventDefault();

		hanberger_btn.removeClass("is-active");
		$("#itmar_mdBlock_drawer_background").removeClass("is-active");
		$(".side_md_content").removeClass("is-active");

		//return false;
	});

	//レスポンシブデザイン
	const reponsiveDesign = () => {
		var element = $(".md_block_content");
		var currentStyles = element.attr("style");
		//元のデザインをキープ
		var currentStylesObject = {};
		if (currentStyles) {
			currentStyles.split(";").forEach(function (style) {
				if (style.trim()) {
					var [property, value] = style.split(":");
					currentStylesObject[property.trim()] = value.trim();
				}
			});
		}

		//ビューポートの大きさによってデザインデータを決定
		var viewportWidth = $(window).width();
		var designData;

		if (viewportWidth >= 767) {
			designData = element.data("default_design");
		} else {
			designData = element.data("mobile_design");
		}
		var responsiveStyle = generateStyleObject(designData);

		// レスポンシブのスタイルオブジェクトと元のスタイルオブジェクトをマージ
		var mergedStyles = { ...currentStylesObject, ...responsiveStyle };

		element.css(mergedStyles);
	};
	//スタイルオブジェクトの生成関数
	const generateStyleObject = (designData) => {
		var styleObject = {};

		// dimensionDataオブジェクトのプロパティをループ
		Object.keys(designData).forEach(function (property) {
			// プロパティの値がオブジェクトの場合
			if (typeof designData[property] === "object") {
				// プロパティのキーをループ
				Object.keys(designData[property]).forEach(function (key) {
					// スタイルプロパティを生成してstyleObjectに追加
					styleObject[property + "-" + key] = designData[property][key];
				});
			}
			// プロパティの値が文字列の場合
			else if (typeof designData[property] === "string") {
				// スタイルプロパティを生成してstyleObjectに追加
				styleObject[property] = designData[property];
			}
		});

		return styleObject;
	};
	// 初期読み込み時にreponsiveDesign()を実行
	reponsiveDesign();

	// ウィンドウのリサイズ時にreponsiveDesign()を実行
	$(window).resize(reponsiveDesign);
});
