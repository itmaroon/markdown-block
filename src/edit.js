
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
//import DesignTitle from 'itmar/design-title';

import { useState, useEffect, useMemo } from '@wordpress/element';

import './editor.scss';

const blockRender = ({ node, level, ...props }) => {
	<InnerBlocks
		template={[
			['itmar/design-title', {}],
		]}
	/>
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
	h1: blockRender,
	h2: blockRender,

}

export default function Edit({ attributes, setAttributes }) {
	const { content } = attributes;

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
				setAttributes({ content: content + markDown_img })
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



	return (
		<div {...useBlockProps()}>
			<div className='area_wrapper'>
				<div className='edit_area'>
					<SimpleMDE
						value={content}
						onChange={(value) => setAttributes({ content: value })}
						options={autoUploadImage}
					/>
				</div>
				<div className='previw_area'>

					<ReactMarkdown components={components}>
						{content}
					</ReactMarkdown>
				</div>
			</div>


		</div>
	);
}
