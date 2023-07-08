
import { __ } from '@wordpress/i18n';

import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import showdown from 'showdown';
import { marked } from 'marked';
import MarkdownIt from 'markdown-it';
import { useDispatch, useSelect } from '@wordpress/data';
import equal from 'fast-deep-equal';
import MultiSelect from './MultiSelect';

import {
	Button,
	Panel,
	PanelBody,
	PanelRow,
	ToggleControl,
	RangeControl,
	RadioControl,
	TextControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	BlockAlignmentControl,
	BlockControls,
	InnerBlocks,
	InspectorControls,
	PanelColorSettings,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
	__experimentalBorderRadiusControl as BorderRadiusControl
} from '@wordpress/block-editor';

import { useState, useEffect, useMemo, useRef } from '@wordpress/element';

import './editor.scss';

// エクステンションの定義(引用元の表現)
// showdown.extension('quoteCitation', function () {
// 	return [{
// 		type: 'lang',
// 		regex: /(^|\n)> --( .+?\n)/gm,
// 		replace: function (match, prefix, citation) {
// 			return prefix + '> <cite>' + citation.trim() + '</cite>\n';
// 		}
// 	}];
// });

// HTMLからセルを抽出する関数
function extractCells(rowElement, cellTagName) {
	const cells = Array.from(rowElement.querySelectorAll(cellTagName));
	return cells.map(cell => ({ content: cell.textContent, tag: cellTagName }));
}

// HTMLから行を抽出する関数
function extractRows(sectionElement, rowTagName, cellTagName) {
	if (!sectionElement) {
		return []
	}
	const rows = Array.from(sectionElement.querySelectorAll(rowTagName));
	return rows.map(row => ({ cells: extractCells(row, cellTagName) }));
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		mdContent,
		blockArray,
		element_style_obj,
		is_toc,
		toc_set_array
	} = attributes;

	const blockProps = useBlockProps();


	//エディタの参照を取得
	const simpleMdeRef = useRef();

	//画像ファイルのアップロードとマークダウンの挿入
	const imageUploadFunction = (file) => {
		const nonce = itmar_option.nonce // Wordpressから取得したnonce

		// FormDataオブジェクトを作成し、ファイルを追加
		const formData = new FormData();
		formData.append('file', file);

		// fetchを使用してファイルをアップロード
		fetch('/wp-json/wp/v2/media', {
			method: 'POST',
			headers: {
				'X-WP-Nonce': nonce
			},
			body: formData
		})
			.then(response => response.json())
			.then(data => {
				const markDown_img = `\n![image](${data.source_url})`;
				if (simpleMdeRef.current) {
					simpleMdeRef.current.codemirror.replaceSelection(markDown_img);
				}

			})
			.catch(error => {
				console.error('Upload failed:', error);
			});

	}

	// エディタの設定
	const autoUploadImage = useMemo(() => {
		return {
			uploadImage: true,
			imageUploadFunction,
			maxHeight: '60vh',
			toolbar: ["undo", "redo", "|", "bold", "italic", "heading", "|", "code", "quote", "link", "unordered-list", "ordered-list", "table", "|", "guide"]
		};
	}, []);
	//スクロールイベントの登録（クリーンアップも含む）
	useEffect(() => {
		if (simpleMdeRef.current) {
			const editorInstance = simpleMdeRef.current;
			const codemirror = editorInstance.codemirror;

			codemirror.on('scroll', handleScroll);

			return () => {
				codemirror.off('scroll', handleScroll);
			};
		}
	}, [simpleMdeRef.current]);

	//スクロールのハンドラ
	const handleScroll = () => {
		const editorInstance = simpleMdeRef.current;
		const scrollInfo = editorInstance.codemirror.getScrollInfo();
		//console.log('Scroll Position:', scrollInfo.top);
	};

	//removeBlocks関数の取得
	const { removeBlocks, updateBlockAttributes } = useDispatch('core/block-editor');

	//インナーブロックの監視
	const innerBlockIds = useSelect((select) =>
		select('core/block-editor').getBlocks(clientId).map((block) => block.clientId)
	);
	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);
	//選択中のブロック
	const selectedBlock = useSelect(
		(select) => select('core/block-editor').getSelectedBlock(),
		[]
	);

	//インナーブロックの変化による属性値の記録
	useEffect(() => {
		if (innerBlocks.length > 0) {
			//選択されたブロックの情報を収集
			const selectTagMap = {
				'itmar/design-title': selectedBlock?.attributes.headingType,
				'core/paragraph': 'P',
				'itmar/code-highlight': 'PRE',
				'core/image': 'IMG',
				'core/quote': 'BLOCKQUOTE',
				'core/list': selectedBlock?.attributes.list_type,
				'core/table': 'TABLE',
				// 以下同様に続く
			};
			const select_key = selectTagMap[selectedBlock?.name]

			//登録済みのスタイルを展開
			let newAttributes = { ...element_style_obj };
			let stockStyle = null;
			for (let block of innerBlocks) {
				const tagMap = {
					'itmar/design-title': block.attributes.headingType,
					'core/paragraph': 'P',
					'itmar/code-highlight': 'PRE',
					'core/image': 'IMG',
					'core/quote': 'BLOCKQUOTE',
					'core/list': block.attributes.list_type,
					'core/table': 'TABLE',
					// 以下同様に続く
				};
				const key = tagMap[block.name];
				//スタイル以外の属性を削除
				const { headingContent, content, url, headingID, codeArea, fileName, citation, head, body, foot, ...styleAttributes } = block.attributes;
				// 更新対象のブロックが選択中のブロックでなく、
				// かつ、更新対象のブロックが選択中のブロックと同じkeyを持つ場合
				if (block.clientId !== selectedBlock?.clientId && key === select_key
				) {
					const { headingContent, content, url, headingID, codeArea, fileName, citation, head, body, foot, ...selectAttributes } = selectedBlock.attributes;
					if (styleAttributes !== selectAttributes) { // 既に更新されたブロックを再度更新しないようにする
						updateBlockAttributes(block.clientId, { ...block.attributes, ...selectAttributes });
					}
				}

				//新しいスタイルを上書き
				newAttributes[key] = styleAttributes;
				//選択中のブロックのスタイルをストック
				if (selectedBlock && (block.clientId === selectedBlock.clientId)) {
					stockStyle = { [key]: styleAttributes };
				}

			};

			//ストックしたスタイルがあれば上書き
			if (stockStyle) {
				newAttributes = {
					...newAttributes,
					...stockStyle
				};
			}

			//ブロック属性に登録
			setAttributes({
				element_style_obj: newAttributes
			});
		}

	}, [innerBlocks]);

	//ブロックのテンプレート要素の変化を検証する配列
	const [tempBlockArray, setTempBlockArray] = useState([]);
	// useRefを使用して前回のblockArrayを保持します
	const prevBlockArrayRef = useRef();
	useEffect(() => {
		prevBlockArrayRef.current = blockArray;
	}, [blockArray]);
	const prevBlockArray = prevBlockArrayRef.current;

	//DOM要素の再生成
	useEffect(() => {
		if (!mdContent) return;//mdContent文書がなければ処理しない

		//const converter = new showdown.Converter({ simpleLineBreaks: true, extensions: ['quoteCitation', 'splitQuoteBlocks'] });
		//const html = converter.makeHtml(mdContent);
		// marked.use({//markedのオプション設定
		// 	breaks: true,
		// 	gfm: true,
		// 	mangle: false,
		// 	headerIds: false
		// });
		// const html = marked.parse(mdContent);
		const converter = new MarkdownIt({
			breaks: true,  // これにより、単一の改行が <br> に変換されるようになります
		});
		const html = converter.render(mdContent);
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const newblockArray = [];
		let block_count = 0;//追加されるブロックのカウント

		//リスト要素をgutenbergのブロックにする
		function listDOMToBlocks(element) {
			const listItems = Array.from(element.children).filter(child => child.tagName.toLowerCase() === 'li');//element要素直下のli要素を取得
			const listArray = listItems.map(listItem => {
				const nestedList = listItem.querySelector('ul, ol');//li要素の下にul,ol要素があるか
				let nestedBlocks = [];

				if (nestedList) {
					nestedBlocks = listDOMToBlocks(nestedList);//li要素の下にul,ol要素がある場合は再帰処理
				}

				const textNode = Array.from(listItem.childNodes).find(node => node.nodeType === Node.TEXT_NODE);//li要素内の最初のテキストノード
				const listItemBlock = [
					'core/list-item',
					{
						content: textNode ? textNode.textContent : '', // テキストノードの内容を取得
					},
				];

				if (nestedBlocks.length > 0) {
					//const { className, ...filter_class_attr } = attributes || {};
					const ordered = nestedList.tagName === 'OL';//順序付きか
					listItemBlock.push([
						['core/list',
							{ ordered: ordered },
							nestedBlocks]
					]);
				}
				return listItemBlock;
			})
			return listArray

		}


		const traverseDOM = (() => {
			let counter = 0;//走査されるDOM要素のカウント
			return (element, callback) => {
				callback(element, counter++);

				const children = element.children;
				for (let i = 0; i < children.length; i++) {
					//traverseDOM(children[i], callback);
					callback(children[i], counter++);
				}
			};
		})();

		traverseDOM(doc.body, (element, count) => {//body直下のDOMのみ走査
			let elementType = element.tagName;

			if (elementType.match(/^H[1-6]$/)) {
				block_count++;
				const attributes = element_style_obj[elementType];
				newblockArray.push(['itmar/design-title', { ...attributes, headingContent: element.textContent, headingType: element.tagName, headingID: `toc-${count}` }]);
			} else if (elementType.match(/^P$/)) {
				block_count++;
				if (element.children[0]?.tagName.match(/^IMG$/)) {
					elementType = element.children[0].tagName;
					const attributes = element_style_obj[elementType];
					newblockArray.push(['core/image', { ...attributes, className: 'itmar_md_block', url: element.children[0].src }]);
				} else {
					const attributes = element_style_obj[elementType];
					newblockArray.push(['core/paragraph', { ...attributes, className: 'itmar_md_block', content: element.innerHTML }]);
				}
			} else if (elementType.match(/^PRE$/)) {
				block_count++;
				const attributes = element_style_obj[elementType];
				if (innerBlocks.length >= block_count) {
					newblockArray.push(['itmar/code-highlight', { ...attributes, codeArea: element.textContent, fileName: innerBlocks[block_count - 1].attributes.fileName }]);
				} else {
					newblockArray.push(['itmar/code-highlight', { ...attributes, codeArea: element.textContent }]);
				}
			} else if (elementType.match(/^UL|OL$/)) {
				block_count++;
				const ordered = elementType === 'OL';//順序付きか
				const attributes = element_style_obj[elementType];
				const list_Array = listDOMToBlocks(element);
				newblockArray.push(['core/list', { ...attributes, ordered: ordered, className: 'itmar_md_block', list_type: element.tagName }, list_Array,]);
			} else if (elementType.match(/^BLOCKQUOTE$/)) {
				block_count++;
				const attributes = element_style_obj[elementType];
				const block_content = element.children[0].innerHTML;
				//引用元（cite）の文字列を取得
				const match = block_content.match(/-- (.+?)(<|$)/);
				const citation = match ? match[1] : null;  // 引用元のテキスト

				const quote_str = element.children[0].innerHTML.replace(/-- .+?(?=<|$)/, '');
				newblockArray.push(
					[
						'core/quote',
						{ ...attributes, className: 'itmar_md_block', citation: citation },
						[
							['core/paragraph', { content: quote_str }]
						]
					]
				);
			} else if (elementType.match(/^TABLE$/)) {
				block_count++;
				const attributes = element_style_obj[elementType];

				// テーブルヘッダーとテーブルボディを抽出
				const tableHead = extractRows(element.querySelector("thead"), 'tr', 'th');
				const tableBody = extractRows(element.querySelector("tbody"), 'tr', 'td');
				const tablefoot = extractRows(element.querySelector("tfoot"), 'tr', 'td');
				// 抽出したデータを使ってcore/tableブロックを初期化
				const blockArray =
					['core/table', { ...attributes, className: 'itmar_md_block', hasFixedLayout: true, head: tableHead, body: tableBody, foot: tablefoot }]
					;
				newblockArray.push(
					blockArray
				);
			}


		});

		if (!equal(newblockArray, prevBlockArray)) {
			setTempBlockArray(newblockArray);
		}
	}, [mdContent])

	//tempBlockArrayに変化があればブロックを一旦削除
	useEffect(() => {
		if (innerBlockIds !== 0) {
			removeBlocks(innerBlockIds);
		}
	}, [tempBlockArray]);

	//ブロックの削除を確認して再度ブロックをレンダリング
	useEffect(() => {
		if (innerBlockIds.length === 0) {
			setAttributes({ blockArray: tempBlockArray });
		}
	}, [tempBlockArray, innerBlockIds.length]);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__('Table of Content', 'block-location')}
					initialOpen={true}
				>
					<PanelRow>
						<ToggleControl
							label={__('Table of Content Render', 'block-location')}
							checked={is_toc}
							onChange={(val) => setAttributes({ is_toc: val })}
						/>
					</PanelRow>
					{is_toc &&  //上記が true の場合に表示
						<PanelRow>
							<MultiSelect
								stockArrayName="toc_set_array"
								stokArray={toc_set_array}
								type='checkBox'
								option={[{ title: 'ヘッダー部分', value: 'header' }, { title: 'サイドバー部分', value: 'sidebar' }]}
								setAttributes={setAttributes}
							/>
						</PanelRow>
					}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className='area_wrapper'>
					<div className='edit_area' onScroll={handleScroll}>
						<SimpleMDE
							getMdeInstance={instance => { simpleMdeRef.current = instance; }}
							value={mdContent}
							onChange={(value) => setAttributes({ mdContent: value })}
							options={autoUploadImage}
						/>
					</div>
					<div className='previw_area'>
						<InnerBlocks
							template={blockArray}
						//templateLock="all"
						/>

					</div>
				</div>
			</div>
		</>

	);
}
