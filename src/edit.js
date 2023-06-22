
import { __ } from '@wordpress/i18n';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import styled, { css } from 'styled-components';
import showdown from 'showdown';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

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

const StyledDiv = styled.div.attrs(props => ({
	as: props.tag || 'div',
}))`
  color: red;
`;

const blockRender = ({ node, level, ...props }) => {
	return (
		<InnerBlocks
			template={[
				['itmar/design-title', { headingContent: props.children }],
			]}
		/>
	)

};


//シンタックスハイライトのレンダリング設定
const components = {
	code({ node, inline, className, children, ...props }) {
		const match = /language-(\w+)/.exec(className || '')
		return !inline && match ? (
			<SyntaxHighlighter style={dark} language={match[1]} PreTag="div" {...props}>
				{String(children).replace(/\n$/, '')}
			</SyntaxHighlighter>
		) : (
			<code className={className} {...props}>
				{children}
			</code>
		)
	},
	//h1: blockRender,
	// h2: blockRender2,
	// h3: blockRender,
	// h4: blockRender,
	// h5: blockRender,
	// h6: blockRender,

}

export default function Edit({ attributes, setAttributes }) {
	const {
		mdContent,
		blockArray,
	} = attributes;

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

	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const blockProps = useBlockProps();

	useEffect(() => {
		const converter = new showdown.Converter();
		const html = converter.makeHtml(mdContent);
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const newblockArray = [];
		const traverseDOM = (element, callback) => {
			callback(element);

			const children = element.children;
			for (let i = 0; i < children.length; i++) {
				traverseDOM(children[i], callback);
			}
		}
		traverseDOM(doc.documentElement, (element) => {
			if (element.tagName.match(/^H[1-6]$/)) {
				newblockArray.push(['itmar/design-title', { headingContent: element.textContent }]);
			} else if (element.tagName.match(/^P$/)) {
				newblockArray.push(['core/paragraph', { content: element.textContent }]);
			}

		});
		//setAttributes({ blockArray: newblockArray });
		//replaceInnerBlocks(blockProps.id, newblockArray, false);
	}, [mdContent, replaceInnerBlocks, blockProps.id]);

	return (
		<>
			<div {...useBlockProps()}>
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
							templateLock="all"
						/>
						<ReactMarkdown components={components}>
							{mdContent}
						</ReactMarkdown>
					</div>
				</div>
			</div>
		</>

	);
}
