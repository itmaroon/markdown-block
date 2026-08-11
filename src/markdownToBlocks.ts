import { marked } from 'marked';
import type { AttributeRecord, BlockTemplate, EditorBlock } from './types';

interface TableCell {
	content: string | null;
	tag: string;
}

interface TableRow {
	cells: TableCell[];
}

// HTMLからセルを抽出する
const extractCells = (
	rowElement: Element,
	cellTagName: string
): TableCell[] =>
	Array.from( rowElement.querySelectorAll( cellTagName ) ).map(
		( cell ) => ( {
			content: cell.textContent,
			tag: cellTagName,
		} )
	);

// HTMLから行を抽出する
const extractRows = (
	sectionElement: Element | null,
	rowTagName: string,
	cellTagName: string
): TableRow[] => {
	if ( ! sectionElement ) {
		return [];
	}

	return Array.from( sectionElement.querySelectorAll( rowTagName ) ).map(
		( row ) => ( {
			cells: extractCells( row, cellTagName ),
		} )
	);
};

const listDOMToBlocks = ( element: Element ): BlockTemplate[] =>
	Array.from( element.children )
		.filter( ( child ) => child.tagName.toLowerCase() === 'li' )
		.map( ( listItem ) => {
			const nestedList = listItem.querySelector(
				':scope > ul, :scope > ol'
			);
			const textNode = Array.from( listItem.childNodes ).find(
				( node ) => node.nodeType === 3
			);
			const listItemBlock: BlockTemplate = [
				'core/list-item',
				{ content: textNode?.textContent || '' },
			];

			if ( nestedList ) {
				listItemBlock[ 2 ] = [
					[
						'core/list',
						{ ordered: nestedList.tagName === 'OL' },
						listDOMToBlocks( nestedList ),
					],
				];
			}

			return listItemBlock;
		} );

/**
 * MarkdownをInnerBlocksテンプレートへ変換する。
 * 同じ入力から同じ結果を返し、WordPressのデータストアは変更しない。
 *
 * @param mdContent       Markdown本文。
 * @param elementStyleObj HTML要素ごとのスタイル属性。
 * @param existingBlocks  現在のInnerBlocks。
 * @return InnerBlocksテンプレート。
 */
export const createMarkdownBlockTemplate = (
	mdContent: string | undefined,
	elementStyleObj: Record< string, AttributeRecord > = {},
	existingBlocks: EditorBlock[] = []
): BlockTemplate[] => {
	if ( ! mdContent ) {
		return [];
	}

	const html = marked.parse( mdContent, {
		breaks: true,
		gfm: true,
		mangle: false,
		headerIds: false,
	} );
	const doc = new window.DOMParser().parseFromString( html, 'text/html' );
	const template: BlockTemplate[] = [];
	const existingCodeFileNames = existingBlocks
		.filter( ( block ) => block.name === 'itmar/code-highlight' )
		.map( ( block ) => block.attributes.fileName );
	let codeBlockIndex = 0;

	Array.from( doc.body.children ).forEach( ( element, index ) => {
		let elementType = element.tagName;
		const headingId = `toc-${ index + 1 }`;

		if ( /^H[1-6]$/.test( elementType ) ) {
			template.push( [
				'itmar/design-title',
				{
					...( elementStyleObj[ elementType ] || {} ),
					headingContent: element.textContent,
					headingType: elementType,
					headingID: headingId,
				},
			] );
			return;
		}

		if ( elementType === 'P' ) {
			const firstChild = element.children[ 0 ];
			if ( firstChild?.tagName === 'IMG' ) {
				elementType = 'IMG';
				template.push( [
					'core/image',
					{
						...( elementStyleObj[ elementType ] || {} ),
						className: 'itmar_ex_block',
						url: ( firstChild as HTMLImageElement ).src,
					},
				] );
			} else {
				template.push( [
					'core/paragraph',
					{
						...( elementStyleObj[ elementType ] || {} ),
						className: 'itmar_ex_block',
						content: element.innerHTML,
					},
				] );
			}
			return;
		}

		if ( elementType === 'PRE' ) {
			const fileName = existingCodeFileNames[ codeBlockIndex ];
			codeBlockIndex += 1;
			template.push( [
				'itmar/code-highlight',
				{
					...( elementStyleObj[ elementType ] || {} ),
					codeArea: element.textContent,
					...( fileName !== undefined ? { fileName } : {} ),
				},
			] );
			return;
		}

		if ( /^(UL|OL)$/.test( elementType ) ) {
			template.push( [
				'core/list',
				{
					...( elementStyleObj[ elementType ] || {} ),
					ordered: elementType === 'OL',
					className: 'itmar_ex_block',
					list_type: elementType,
				},
				listDOMToBlocks( element ),
			] );
			return;
		}

		if ( elementType === 'BLOCKQUOTE' ) {
			const blockContent = element.children[ 0 ]?.innerHTML || '';
			const citationMatch = blockContent.match( /-- (.+?)(<|$)/ );
			const quoteContent = blockContent.replace( /-- .+?(?=<|$)/, '' );
			template.push( [
				'core/quote',
				{
					...( elementStyleObj[ elementType ] || {} ),
					className: 'itmar_ex_block',
					citation: citationMatch ? citationMatch[ 1 ] : null,
				},
				[ [ 'core/paragraph', { content: quoteContent } ] ],
			] );
			return;
		}

		if ( elementType === 'TABLE' ) {
			template.push( [
				'core/table',
				{
					...( elementStyleObj[ elementType ] || {} ),
					className: 'itmar_ex_block',
					hasFixedLayout: true,
					head: extractRows(
						element.querySelector( 'thead' ),
						'tr',
						'th'
					),
					body: extractRows(
						element.querySelector( 'tbody' ),
						'tr',
						'td'
					),
					foot: extractRows(
						element.querySelector( 'tfoot' ),
						'tr',
						'td'
					),
				},
			] );
		}
	} );

	return template;
};
