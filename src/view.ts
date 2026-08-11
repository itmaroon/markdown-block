import jQuery from 'jquery';

interface TitleDataAttributes {
	headingID?: string;
}

type DesignData = Record< string, string | Record< string, string > >;

jQuery( function ( $: JQueryStatic ) {
	let headerHeight = 0;

	// design-titleの保存属性から目次のジャンプ先IDを復元する
	$( '.wp-block-itmar-markdown-block' ).each( function (
		this: HTMLElement,
		blockIndex: number
	) {
		const markdownBlock = this;
		const $markdownBlock = $( markdownBlock );

		$markdownBlock.find( '.wp-block-itmar-design-title' ).each( function (
			this: HTMLElement
		) {
			const titleElement = this;
			const $title = $( titleElement );
			const $wrap = $title.children( '.itmar-wrap' ).first();
			const serializedAttributes = $title.attr( 'data-attributes' );

			if ( ! $wrap.length || ! serializedAttributes ) {
				return;
			}

			let attributes: TitleDataAttributes;
			try {
				attributes = JSON.parse(
					serializedAttributes
				) as TitleDataAttributes;
			} catch ( error ) {
				return;
			}

			const originalId = attributes.headingID;
			if ( ! originalId ) {
				return;
			}

			let targetId = originalId;
			const existingTarget = document.getElementById( originalId );

			if ( existingTarget && existingTarget !== $wrap[ 0 ] ) {
				// 同じタイトル内に旧IDがあれば、内側のラッパーへ移す
				if (
					existingTarget === titleElement ||
					titleElement.contains( existingTarget )
				) {
					existingTarget.removeAttribute( 'id' );
				} else {
					// 複数のMarkdownブロックでtoc-Nが重複する場合は固有化する
					targetId = `itmar-md-${ blockIndex + 1 }-${ originalId }`;
				}
			}

			$wrap.attr( 'id', targetId );
			$markdownBlock
				.find( '.table-of-contents a[href="#' + originalId + '"]' )
				.attr( 'href', `#${ targetId }` );
		} );
	} );

	//ページ内スムーススクロール
	$( '.table-of-contents a[href^="#"]' ).on(
		'click',
		function ( this: HTMLElement, event: Event ) {
			const speed = 500;
			const id = $( this ).attr( 'href' );
			if ( ! id ) {
				return;
			}

			const targetElement =
				id === '#'
					? document.documentElement
					: document.getElementById(
							decodeURIComponent( id.slice( 1 ) )
					  );

			if ( ! targetElement ) {
				return;
			}

			const targetOffset = $( targetElement ).offset();
			if ( ! targetOffset ) {
				return;
			}

			event.preventDefault();
			const position = targetOffset.top - ( headerHeight + 50 );
			$( 'body,html' ).animate(
				{ scrollTop: position },
				speed,
				'linear',
				function () {
					//スマホ対応のボタン類を消去
					hanberger_btn.removeClass( 'is-active' );
					$( '#itmar_mdBlock_drawer_background' ).removeClass(
						'is-active'
					);
					$( '.side_md_content' ).removeClass( 'is-active' );
				}
			);
		}
	);

	//tocのアコーデオン
	const speed = 300;
	$( '.btn_open' ).on( 'click', function ( this: HTMLElement ) {
		const list = $( this ).parent().next();
		if ( $( this ).hasClass( 'is_open' ) ) {
			list.slideUp( speed );
		} else {
			list.slideDown( speed );
		}

		$( this ).toggleClass( 'is_open' );
	} );

	//タイトル要素が可視領域に入った時の処理
	function findTopElement() {
		var fromTop = $( window ).scrollTop() ?? 0;
		var toBottom = fromTop + ( $( window ).height() ?? window.innerHeight );
		var tocElements = $( '.wp-block-itmar-design-title > .itmar-wrap[id]' );

		var visibleElements = tocElements.filter( function (
			this: HTMLElement
		) {
			var elementOffset = $( this ).offset();
			if ( ! elementOffset ) return false;

			var elementTop = elementOffset.top;
			var elementBottom = elementTop + ( $( this ).outerHeight() ?? 0 );
			return elementTop >= fromTop && elementBottom <= toBottom;
		} );

		var topElement = visibleElements.first();

		if ( topElement.length ) {
			var elementId = topElement.attr( 'id' );
			var anchorElement = $(
				'.md_toc_sidebar a[href="#' + elementId + '"]'
			).parents( 'li' );

			if ( ! anchorElement.length ) return;

			$( '.md_toc_sidebar li' ).removeClass(
				'checked check_prev check_next'
			); //全ての要素からクラスを外す
			anchorElement.addClass( 'checked ready' ); //チェックされた要素
			anchorElement.prevAll( 'li' ).addClass( 'check_prev' ); //それより前の要素
			anchorElement.nextAll( 'li' ).addClass( 'check_next' ); //それより後の要素

			var $parent = anchorElement.closest( 'ul' ); //anchorElementの親要素（ul）を取得
			if ( ! $parent.length ) return;

			// anchorElementと親要素の各辺の位置を取得
			var anchorOffset = anchorElement.offset();
			var parentOffset = $parent.offset();
			if ( ! anchorOffset || ! parentOffset ) return;

			var anchorTop = anchorOffset.top;
			var anchorBottom = anchorTop + ( anchorElement.outerHeight() ?? 0 );
			var parentTop = parentOffset.top;
			var parentBottom = parentTop + ( $parent.innerHeight() ?? 0 );

			// ターゲット要素が親要素の表示範囲をオーバーフローしているかを検査
			if ( anchorTop < parentTop || anchorBottom > parentBottom ) {
				//オーバーフローしていればスクロール
				$parent.animate(
					{ scrollTop: anchorElement.position().top },
					500
				);
			}
		}
	}

	findTopElement();
	$( window ).on( 'scroll', findTopElement );

	//ドロワーボタン
	let hanberger_btn = $( '#itmar_mdBlock_hanberger' );

	$( window ).on( 'scroll', function ( this: Window ) {
		if ( ( $( 'html' ).width() ?? window.innerWidth ) < 768 ) {
			//スマホの場合
			if ( ( $( this ).scrollTop() ?? 0 ) >= 500 ) {
				hanberger_btn.fadeIn( 500 );
			} else {
				if ( ! hanberger_btn.hasClass( 'is-active' ) ) {
					hanberger_btn.fadeOut( 500 );
				}
			}
		} else {
			hanberger_btn.hide();
		}
	} );

	hanberger_btn.on( 'click', function ( this: HTMLElement ) {
		$( this ).toggleClass( 'is-active' );
		$( '.side_md_content' ).toggleClass( 'is-active' );
		$( '#itmar_mdBlock_drawer_background' ).toggleClass( 'is-active' );
	} );

	$( '#itmar_mdBlock_drawer_background' ).on( 'click', function () {
		//e.preventDefault();

		hanberger_btn.removeClass( 'is-active' );
		$( '#itmar_mdBlock_drawer_background' ).removeClass( 'is-active' );
		$( '.side_md_content' ).removeClass( 'is-active' );

		//return false;
	} );

	//レスポンシブデザイン
	const reponsiveDesign = () => {
		var element = $( '.md_block_content' );
		//マークダウンブロックのDOM要素がない場合はリターン
		if ( element.length === 0 ) return;

		var currentStyles = element.attr( 'style' );
		//元のデザインをキープ
		var currentStylesObject: Record< string, string > = {};
		if ( currentStyles ) {
			currentStyles.split( ';' ).forEach( function ( style: string ) {
				if ( style.trim() ) {
					var [ property, value ] = style.split( ':' );
					if ( property && value ) {
						currentStylesObject[ property.trim() ] = value.trim();
					}
				}
			} );
		}

		//ビューポートの大きさによってデザインデータを決定
		var viewportWidth = $( window ).width() ?? window.innerWidth;
		var designData: DesignData;

		if ( viewportWidth >= 767 ) {
			designData = element.data( 'default_design' );
		} else {
			designData = element.data( 'mobile_design' );
		}
		var responsiveStyle = generateStyleObject( designData );

		// レスポンシブのスタイルオブジェクトと元のスタイルオブジェクトをマージ
		var mergedStyles = { ...currentStylesObject, ...responsiveStyle };

		element.css( mergedStyles );
	};
	//スタイルオブジェクトの生成関数
	const generateStyleObject = (
		designData: DesignData | undefined
	): Record< string, string > => {
		var styleObject: Record< string, string > = {};
		if ( ! designData ) return styleObject;

		// dimensionDataオブジェクトのプロパティをループ
		Object.keys( designData ).forEach( function ( property: string ) {
			// プロパティの値がオブジェクトの場合
			if ( typeof designData[ property ] === 'object' ) {
				// プロパティのキーをループ
				Object.keys( designData[ property ] ).forEach( function (
					key: string
				) {
					// スタイルプロパティを生成してstyleObjectに追加
					const nestedValue = designData[ property ];
					if ( typeof nestedValue === 'object' ) {
						styleObject[ property + '-' + key ] =
							nestedValue[ key ];
					}
				} );
			}
			// プロパティの値が文字列の場合
			else if ( typeof designData[ property ] === 'string' ) {
				// スタイルプロパティを生成してstyleObjectに追加
				styleObject[ property ] = designData[ property ] as string;
			}
		} );

		return styleObject;
	};
	// 初期読み込み時にreponsiveDesign()を実行
	reponsiveDesign();

	// ウィンドウのリサイズ時にreponsiveDesign()を実行
	$( window ).on( 'resize', reponsiveDesign );
} );
