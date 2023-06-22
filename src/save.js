
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const anckerRender = ({ node, level, ...props }) => {
	const Tag = `h${level}`
	return (
		<Tag tag={`h${level}`} id={`toc-${node.position?.start.line.toString()}`}>
			{props.children}
		</Tag>
	)

};



const linkRender = ({ node, level, ...props }) => {
	return (
		<a href={`#toc-${node.position?.start.line.toString()}`} className={`lv-${level}`}>{props.children}</a>
	);
};

const bodyRender = {
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
	h1: anckerRender,
	h2: anckerRender,
	h3: anckerRender,
	h4: anckerRender,
	h5: anckerRender,
	h6: anckerRender,
}

const tocRender = {
	h1: linkRender,
	h2: linkRender,
	h3: linkRender,
	h4: linkRender,
	h5: linkRender,
	h6: linkRender,
}

export default function save({ attributes }) {
	const { mdContent } = attributes;
	return (
		<div {...useBlockProps.save()}>
			<div className='table-of-contents'>
				<h3>Table of Contents</h3>
				<ReactMarkdown components={tocRender} allowedElements={["h1", "h2", "h3", "h4", "h5", "h6"]} >
					{mdContent}
				</ReactMarkdown>
			</div>
			<InnerBlocks.Content />
			<ReactMarkdown components={bodyRender}>
				{mdContent}
			</ReactMarkdown>
		</div>

	);
}
