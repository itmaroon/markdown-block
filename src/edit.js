
import { __ } from '@wordpress/i18n';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import showdown from 'showdown';
import { useDispatch, useSelect } from '@wordpress/data';
import equal from 'fast-deep-equal';

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


export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		mdContent,
		blockArray,
		element_style_obj
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
			toolbar: ["undo", "redo", "|", "bold", "italic", "heading", "|", "code", "quote", "link", "unordered-list", "ordered-list", "guide"]
		};
	}, []);

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
			//登録済みのスタイルを展開
			let newAttributes = { ...element_style_obj };
			let stockStyle = null;
			for (let block of innerBlocks) {
				const tagMap = {
					'itmar/design-title': block.attributes.headingType,
					'core/paragraph': 'P',
					// 以下同様に続く
				};
				const key = tagMap[block.name];
				//スタイル以外の属性を削除
				const { headingContent, content, headingID, ...styleAttributes } = block.attributes;
				//'itmar/design-title'のクラス名とoptionStyleのクラス名が不一致の時は再レンダリングさせない(まだoptionStyleがセット未了の段階)
				if (
					block.name === 'itmar/design-title'
					&& styleAttributes.className
					&& styleAttributes.className != 'is-style-nomal'
					&& (!styleAttributes.optionStyle || (styleAttributes.optionStyle && (styleAttributes.className != styleAttributes.optionStyle.styleName)))
				) continue;

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
			if (!equal(newAttributes, element_style_obj)) {//スタイルに変化があるときのみ
				setAttributes({
					element_style_obj: newAttributes
				});
			}
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
		const converter = new showdown.Converter();
		const html = converter.makeHtml(mdContent);
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const newblockArray = [];
		const traverseDOM = (() => {
			let counter = 0;
			return (element, callback) => {
				callback(element, counter++);

				const children = element.children;
				for (let i = 0; i < children.length; i++) {
					traverseDOM(children[i], callback);
				}
			};
		})();

		traverseDOM(doc.documentElement, (element, count) => {
			const elementType = element.tagName;

			if (elementType.match(/^H[1-6]$/)) {
				const attributes = element_style_obj[elementType];
				newblockArray.push(['itmar/design-title', { ...attributes, headingContent: element.textContent, headingType: element.tagName, headingID: `toc-${count}` }]);
			} else if (elementType.match(/^P$/)) {
				const attributes = element_style_obj[elementType];
				newblockArray.push(['core/paragraph', { ...attributes, content: element.textContent }]);
			}
		});

		if (!equal(newblockArray, prevBlockArray)) {
			setTempBlockArray(newblockArray);
		}
	}, [mdContent, element_style_obj])

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
			<div {...blockProps}>
				<div className='area_wrapper'>
					<div className='edit_area'>
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
