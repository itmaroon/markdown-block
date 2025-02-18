import { useEffect, useRef } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import EasyMDE from "easymde";

// **🔹 editorRef をコンポーネント外で宣言**
const editorRef = { current: null };

//画像ファイルのアップロードとマークダウンの挿入
const imageUploadFunction = (file) => {
	const nonce = itmar_markdown_option.nonce; // Wordpressから取得したnonce

	// FormDataオブジェクトを作成し、ファイルを追加
	const formData = new FormData();
	formData.append("file", file);

	// fetchを使用してファイルをアップロード
	apiFetch({
		path: "/wp/v2/media",
		method: "POST",
		headers: {
			"X-WP-Nonce": nonce,
		},
		body: formData,
	})
		.then((data) => {
			if (!data || !data.source_url) {
				throw new Error("Invalid response from server");
			}

			// Markdown 用の画像リンク
			const markDownImg = `\n![image](${data.source_url})\n`;

			// **現在のカーソル位置に画像 Markdown を挿入**
			if (editorRef.current) {
				const cm = editorRef.current.codemirror;

				// **カーソルをドロップ位置に移動してから Markdown を挿入**
				if (editorRef.current.dropPosition) {
					cm.setCursor(editorRef.current.dropPosition);
					cm.replaceRange(markDownImg, editorRef.current.dropPosition);
					editorRef.current.dropPosition = null; // 位置をリセット
				}
			}
		})
		.catch((error) => {
			console.error("Upload failed:", error);
		});
};

const EasyMDEEditor = ({ value, scrollRatio, onChange, onScroll }) => {
	const textareaRef = useRef(null);
	const isSyncingScroll = useRef(false); // スクロール干渉防止フラグ

	useEffect(() => {
		if (!editorRef.current) {
			const editorInstance = new EasyMDE({
				element: textareaRef.current,
				spellChecker: false, // デフォルトのスペルチェッカーを無効化
				uploadImage: true,
				imageUploadFunction,
				toolbar: [
					"undo",
					"redo",
					"|",
					"bold",
					"italic",
					"heading",
					"|",
					"code",
					"quote",
					"link",
					"image",
					"unordered-list",
					"ordered-list",
					"table",
					"|",
					"guide",
				],
			});

			// **🔹 editorRef.current に EasyMDE のインスタンスを保存**
			editorRef.current = editorInstance;

			// **エディタのスクロールイベントを監視**
			editorInstance.codemirror.on("scroll", () => {
				if (isSyncingScroll.current) return; // ループ防止
				isSyncingScroll.current = true;

				const cm = editorInstance.codemirror;
				const scrollInfo = cm.getScrollInfo(); // 現在のスクロール情報
				const editorHeight = scrollInfo.height - scrollInfo.clientHeight; // スクロール可能範囲
				const scrollRatio = scrollInfo.top / editorHeight; // スクロール割合
				onScroll(scrollRatio); //コールバック関数にスクロール割合を返してやる

				requestAnimationFrame(() => {
					isSyncingScroll.current = false; // スクロール処理が完了後にフラグを戻す
				});
			});
			// **ドロップイベントを登録**
			editorInstance.codemirror.on("drop", (cmInstance, event) => {
				event.preventDefault(); // デフォルトの処理を無効化

				// **ドロップ位置を取得**
				const pos = cmInstance.coordsChar({
					left: event.clientX,
					top: event.clientY,
				});

				// **ドロップ位置を記録**
				editorRef.current.dropPosition = pos;
			});

			// `editorInstance` を使ってイベントを設定
			editorInstance.codemirror.on("change", () => {
				onChange(editorInstance.value());
			});
		}
	}, []);

	// **🔹 受け取った `scrollRatio` でエディタのスクロールを同期**
	useEffect(() => {
		if (!editorRef.current || isSyncingScroll.current) return;

		isSyncingScroll.current = true;

		const cm = editorRef.current.codemirror;
		const scrollInfo = cm.getScrollInfo();
		const editorScrollHeight = scrollInfo.height - scrollInfo.clientHeight;
		cm.scrollTo(null, editorScrollHeight * scrollRatio);

		requestAnimationFrame(() => {
			isSyncingScroll.current = false;
		});
	}, [scrollRatio]); // `scrollRatio` が変化したらスクロールを適用

	return <textarea ref={textareaRef} defaultValue={value} />;
};

export default EasyMDEEditor;
