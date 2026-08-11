import { __ } from '@wordpress/i18n';

import 'easymde/dist/easymde.min.css';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import equal from 'fast-deep-equal';
import MultiSelect from './MultiSelect';
import EasyMDEEditor from './EasyMDEEditor';
import { createMarkdownBlockTemplate } from './markdownToBlocks';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';

import {
	Button,
	PanelBody,
	PanelRow,
	ToggleControl,
	Modal,
	Notice,
	ToolbarGroup,
	ToolbarButton,
	__experimentalBoxControl as BoxControl,
	__experimentalBorderBoxControl as BorderBoxControl,
} from '@wordpress/components';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	BlockControls,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
	__experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';

import { useState, useEffect, useRef } from '@wordpress/element';
import {
	ArchiveSelectControl,
	borderProperty,
	radiusProperty,
	marginProperty,
	paddingProperty,
	useIsIframeMobile,
	UpdateAllPostsBlockAttributes,
} from 'itmar-block-packages';

import './editor.scss';
import type {
	AttributeRecord,
	BlockEditProps,
	BlockTemplate,
	CssProperties,
	EditorBlock,
	PostTypeInfo,
	SpacingValues,
} from './types';

type StyleBlock = Pick< EditorBlock, 'name' | 'attributes' >;

interface BlockEditorDispatch {
	replaceInnerBlocks: (
		rootClientId: string,
		blocks: unknown[],
		updateSelection: boolean
	) => void;
	updateBlockAttributes: (
		clientId: string,
		attributes: AttributeRecord
	) => void;
}

interface MarkdownSourceValues {
	elementStyleObj: Record< string, AttributeRecord >;
	innerBlocks: EditorBlock[];
	blockArray: BlockTemplate[];
}

const getStyleKey = ( block?: StyleBlock | null ): string | undefined => {
	if ( ! block ) return undefined;

	const tagMap: Record< string, unknown > = {
		'itmar/design-title': block?.attributes.headingType,
		'core/paragraph': 'P',
		'itmar/code-highlight': 'PRE',
		'core/image': 'IMG',
		'core/quote': 'BLOCKQUOTE',
		'core/list':
			block?.attributes.list_type ||
			( block?.attributes.ordered ? 'OL' : 'UL' ),
		'core/table': 'TABLE',
	};

	const styleKey = tagMap[ block.name ];
	return typeof styleKey === 'string' ? styleKey : undefined;
};

const getStyleAttributes = (
	attributes: AttributeRecord = {}
): AttributeRecord => {
	const styleAttributes = { ...attributes };
	[
		'headingContent',
		'content',
		'url',
		'headingID',
		'codeArea',
		'fileName',
		'citation',
		'head',
		'body',
		'foot',
		'id',
		'ordered',
		'list_type',
	].forEach( ( attributeName ) => delete styleAttributes[ attributeName ] );

	return styleAttributes;
};

const applyStyleToBlockTemplate = (
	template: BlockTemplate[],
	styleKey: string,
	styleAttributes: AttributeRecord
): BlockTemplate[] =>
	template.map( ( templateItem ) => {
		const [ blockName, blockAttributes = {} ] = templateItem;
		if (
			getStyleKey( { name: blockName, attributes: blockAttributes } ) !==
			styleKey
		) {
			return templateItem;
		}

		const nextTemplateItem = [ ...templateItem ] as BlockTemplate;
		nextTemplateItem[ 1 ] = { ...blockAttributes, ...styleAttributes };
		return nextTemplateItem;
	} );

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps ) {
	const {
		mdContent,
		blockArray,
		element_style_obj,
		backgroundColor,
		backgroundGradient,
		default_val,
		mobile_val,
		radius_value,
		border_value,
		is_toc,
		toc_set_array,
		isEditMode,
	} = attributes;

	//単色かグラデーションかの選択
	const bgColor = backgroundColor || backgroundGradient;

	//モバイルのフラグ
	const isMobile = useIsIframeMobile();

	//ブロックのスタイル設定
	const margin_value = ! isMobile ? default_val.margin : mobile_val.margin;
	const padding_value = ! isMobile ? default_val.padding : mobile_val.padding;
	const margin_obj = marginProperty( margin_value );
	const padding_obj = paddingProperty( padding_value );
	const radius_obj = radiusProperty( radius_value );
	const border_obj = borderProperty( border_value );
	const blockStyle: CssProperties = {
		background: bgColor,
		...margin_obj,
		...padding_obj,
		...radius_obj,
		...border_obj,
	};

	//スペースのリセットバリュー
	const padding_resetValues = {
		top: '10px',
		left: '10px',
		right: '10px',
		bottom: '10px',
	};

	//ボーダーのリセットバリュー
	const border_resetValues = {
		top: '0px',
		left: '0px',
		right: '0px',
		bottom: '0px',
	};

	const units = [
		{ value: 'px', label: 'px' },
		{ value: 'em', label: 'em' },
		{ value: 'rem', label: 'rem' },
	];

	const blockProps = useBlockProps();

	// プレビュー用の ref
	const previewRef = useRef< HTMLDivElement | null >( null );
	// スクロール干渉防止フラグ
	const isSyncingScroll = useRef( false );
	//スクロール率の保持
	const [ scrollRatio, setScrollRatio ] = useState( 0 );

	//スクロールのハンドラ
	const handleScroll = ( nextScrollRatio: number ) => {
		if ( isSyncingScroll.current ) {
			return;
		}
		isSyncingScroll.current = true;

		setScrollRatio( nextScrollRatio );
		if ( previewRef.current ) {
			const previewHeight =
				previewRef.current.scrollHeight -
				previewRef.current.clientHeight; // プレビューのスクロール可能範囲
			previewRef.current.scrollTop = previewHeight * nextScrollRatio; // プレビューを同期
		}
		window.requestAnimationFrame( () => {
			isSyncingScroll.current = false;
		} );
	};

	// **プレビューのスクロール → エディタを同期**
	useEffect( () => {
		const previewElement = previewRef.current;
		if ( ! previewElement ) {
			return;
		}

		const handlePreviewScroll = () => {
			if ( isSyncingScroll.current ) {
				return;
			}
			isSyncingScroll.current = true;

			const previewHeight =
				previewElement.scrollHeight - previewElement.clientHeight;
			setScrollRatio(
				previewHeight > 0 ? previewElement.scrollTop / previewHeight : 0
			);
			window.requestAnimationFrame( () => {
				isSyncingScroll.current = false;
			} );
		};

		previewElement.addEventListener( 'scroll', handlePreviewScroll );
		return () =>
			previewElement.removeEventListener( 'scroll', handlePreviewScroll );
	}, [] );

	//関数の取得
	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(
		'core/block-editor'
	) as BlockEditorDispatch;

	//インナーブロックの監視
	const innerBlocks = useSelect(
		( select: ( storeName: string ) => any ) =>
			select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	) as EditorBlock[];
	// このMarkdownブロック内で選択中のブロックだけを取得
	const selectedBlock = useSelect(
		( select: ( storeName: string ) => any ) => {
			const blockEditor = select( 'core/block-editor' );
			const selected = blockEditor.getSelectedBlock();
			if ( ! selected ) {
				return null;
			}

			const parentIds = blockEditor.getBlockParents( selected.clientId );
			return parentIds.includes( clientId ) ? selected : null;
		},
		[ clientId ]
	) as EditorBlock | null;

	// 選択した要素のスタイルを同じHTML要素へ同期し、属性にも記録する
	useEffect( () => {
		if ( ! selectedBlock ) {
			return;
		}
		if (
			! innerBlocks.some(
				( block ) => block.clientId === selectedBlock.clientId
			)
		) {
			return;
		}

		const selectedKey = getStyleKey( selectedBlock );
		if ( ! selectedKey ) {
			return;
		}

		const selectedStyles = getStyleAttributes( selectedBlock.attributes );

		innerBlocks.forEach( ( block ) => {
			if (
				block.clientId !== selectedBlock.clientId &&
				getStyleKey( block ) === selectedKey &&
				! equal(
					getStyleAttributes( block.attributes ),
					selectedStyles
				)
			) {
				updateBlockAttributes( block.clientId, selectedStyles );
			}
		} );

		const nextBlockArray = applyStyleToBlockTemplate(
			blockArray,
			selectedKey,
			selectedStyles
		);
		const styleMapChanged = ! equal(
			element_style_obj[ selectedKey ],
			selectedStyles
		);
		const blockArrayChanged = ! equal( blockArray, nextBlockArray );

		if ( styleMapChanged || blockArrayChanged ) {
			setAttributes( {
				...( styleMapChanged
					? {
							element_style_obj: {
								...element_style_obj,
								[ selectedKey ]: selectedStyles,
							},
					  }
					: {} ),
				...( blockArrayChanged ? { blockArray: nextBlockArray } : {} ),
			} );
		}
	}, [
		selectedBlock,
		innerBlocks,
		element_style_obj,
		blockArray,
		setAttributes,
		updateBlockAttributes,
	] );

	// Markdown変換時に最新値を参照しつつ、スタイル変更だけでは再生成しない
	const markdownSourceRefs = useRef< MarkdownSourceValues >( {
		elementStyleObj: element_style_obj,
		innerBlocks,
		blockArray,
	} );
	const [ markdownRevision, setMarkdownRevision ] = useState( 0 );
	useEffect( () => {
		markdownSourceRefs.current = {
			elementStyleObj: element_style_obj,
			innerBlocks,
			blockArray,
		};
	}, [ element_style_obj, innerBlocks, blockArray ] );

	// Markdown変更をデバウンスし、InnerBlocksを一度のdispatchで置き換える
	useEffect( () => {
		let cancelled = false;
		const timerId = window.setTimeout( () => {
			if ( cancelled ) {
				return;
			}

			const {
				elementStyleObj,
				innerBlocks: currentInnerBlocks,
				blockArray: currentBlockArray,
			} = markdownSourceRefs.current;
			const nextBlockArray = createMarkdownBlockTemplate(
				mdContent,
				elementStyleObj,
				currentInnerBlocks
			);
			const needsEmptying =
				nextBlockArray.length === 0 && currentInnerBlocks.length > 0;

			if (
				equal( nextBlockArray, currentBlockArray ) &&
				! needsEmptying
			) {
				return;
			}

			const nextBlocks =
				createBlocksFromInnerBlocksTemplate( nextBlockArray );

			replaceInnerBlocks( clientId, nextBlocks, false );
			markdownSourceRefs.current.blockArray = nextBlockArray;
			setAttributes( { blockArray: nextBlockArray } );
		}, 300 );

		return () => {
			cancelled = true;
			window.clearTimeout( timerId );
		};
	}, [
		mdContent,
		markdownRevision,
		clientId,
		replaceInnerBlocks,
		setAttributes,
	] );

	//確認モーダルの表示フラグ
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ selectedStyleElm, setSelectedStyleElm ] = useState< string | null >(
		null
	);
	const openModal = ( style_elm: string ) => {
		setSelectedStyleElm( style_elm );
		setIsModalOpen( true );
	};
	const closeModal = () => setIsModalOpen( false );
	//処理進捗のモーダルの表示フラグ
	const [ isProgressModal, setIsProgressOpen ] = useState( false );
	const [ isStart, setIsStart ] = useState( false );
	const openProgress = () => setIsProgressOpen( true );
	const closeProgress = () => setIsProgressOpen( false );
	const startProgress = () => setIsStart( true );
	//スタイル属性をコピーする対象の投稿タイプ
	const [ selectedSlug, setPostTypeSlug ] = useState< PostTypeInfo >( {} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Manage Styel HTML Tag', 'markdown-block' ) }
					initialOpen={ false }
				>
					<p>
						{ __(
							'Clears the styles applied to each HTML element.',
							'markdown-block'
						) }
					</p>
					{ Object.keys( element_style_obj ).map( ( style_elm ) => {
						const actions = [
							{
								label: '×',
								onClick: () => openModal( style_elm ),
							},
						];
						return (
							<Notice actions={ actions } isDismissible={ false }>
								<p>{ style_elm }</p>
							</Notice>
						);
					} ) }
				</PanelBody>
				<PanelBody
					title={ __( 'Table of Content', 'markdown-block' ) }
					initialOpen={ true }
				>
					<PanelRow>
						<ToggleControl
							label={ __(
								'Table of Content Render',
								'markdown-block'
							) }
							checked={ is_toc }
							onChange={ ( val: boolean ) =>
								setAttributes( { is_toc: val } )
							}
						/>
					</PanelRow>
					{ is_toc && ( //上記が true の場合に表示
						<PanelRow>
							<MultiSelect
								stockArrayName="toc_set_array"
								stokArray={ toc_set_array }
								type="checkBox"
								option={ [
									{
										title: __(
											'header part',
											'markdown-block'
										),
										value: 'header',
									},
									{
										title: __(
											'sidebar part',
											'markdown-block'
										),
										value: 'sidebar',
									},
								] }
								setAttributes={ setAttributes }
							/>
						</PanelRow>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Style Setting', 'markdown-block' ) }
					initialOpen={ false }
					className="style_ctrl"
				>
					<PanelColorGradientSettings
						title={ __(
							'Background Color Setting',
							'markdown-block'
						) }
						settings={ [
							{
								colorValue: backgroundColor,
								gradientValue: backgroundGradient,

								label: __(
									'Choose Background color',
									'markdown-block'
								),
								onColorChange: (
									newValue: string | undefined
								) =>
									setAttributes( {
										backgroundColor: newValue,
									} ),
								onGradientChange: (
									newValue: string | undefined
								) =>
									setAttributes( {
										backgroundGradient: newValue,
									} ),
							},
						] }
					/>
					<BoxControl
						label={
							! isMobile
								? __(
										'Margin settings(desk top)',
										'markdown-block'
								  )
								: __(
										'Margin settings(mobile)',
										'markdown-block'
								  )
						}
						values={
							! isMobile ? default_val.margin : mobile_val.margin
						}
						onChange={ ( value: SpacingValues ) => {
							if ( ! isMobile ) {
								setAttributes( {
									default_val: {
										...default_val,
										margin: value,
									},
								} );
							} else {
								setAttributes( {
									mobile_val: {
										...mobile_val,
										margin: value,
									},
								} );
							}
						} }
						units={ units } // 許可する単位
						allowReset={ true } // リセットの可否
						resetValues={ padding_resetValues } // リセット時の値
					/>

					<BoxControl
						label={
							! isMobile
								? __(
										'Padding settings(desk top)',
										'markdown-block'
								  )
								: __(
										'Padding settings(mobile)',
										'markdown-block'
								  )
						}
						values={
							! isMobile
								? default_val.padding
								: mobile_val.padding
						}
						onChange={ ( value: SpacingValues ) => {
							if ( ! isMobile ) {
								setAttributes( {
									default_val: {
										...default_val,
										padding: value,
									},
								} );
							} else {
								setAttributes( {
									mobile_val: {
										...mobile_val,
										padding: value,
									},
								} );
							}
						} }
						units={ units } // 許可する単位
						allowReset={ true } // リセットの可否
						resetValues={ padding_resetValues } // リセット時の値
					/>
					<PanelBody
						title={ __( 'Border settings', 'markdown-block' ) }
						initialOpen={ false }
						className="border_design_ctrl"
					>
						<BorderBoxControl
							colors={ [
								{ color: '#72aee6' },
								{ color: '#000' },
								{ color: '#fff' },
							] }
							onChange={ ( newValue: AttributeRecord ) =>
								setAttributes( { border_value: newValue } )
							}
							value={ border_value }
							allowReset={ true } // リセットの可否
							resetValues={ border_resetValues } // リセット時の値
						/>
						<BorderRadiusControl
							values={ radius_value }
							onChange={ ( newBrVal: string | AttributeRecord ) =>
								setAttributes( {
									radius_value:
										typeof newBrVal === 'string'
											? { value: newBrVal }
											: newBrVal,
								} )
							}
						/>
					</PanelBody>
				</PanelBody>
				<PanelBody
					title={ __(
						'Copy styles to other posts',
						'markdown-block'
					) }
					initialOpen={ true }
				>
					<p>
						{ __(
							'Copy the same styles to posts of the selected post type.',
							'markdown-block'
						) }
					</p>
					<ArchiveSelectControl
						selectedSlug={ selectedSlug.slug }
						label={ __( 'Select Post Type', 'markdown-block' ) }
						homeUrl={ markdown_block.home_url }
						onChange={ ( postInfo: PostTypeInfo | undefined ) => {
							if ( postInfo ) {
								setPostTypeSlug( postInfo );
							}
						} }
					/>
					<Button variant="primary" onClick={ openProgress }>
						{ __( 'Apply Style', 'markdown-block' ) }
					</Button>
				</PanelBody>
			</InspectorControls>
			{ isModalOpen && (
				<Modal
					title={ __( 'Erase styles', 'markdown-block' ) }
					onRequestClose={ closeModal }
				>
					<p>
						{ __(
							'Removes the style of a DOM element that has been set.',
							'markdown-block'
						) }
						<br />
						{ __( 'Return to default style.', 'markdown-block' ) }
						<br />
						{ __(
							'It cannot be undone. Is it OK?',
							'markdown-block'
						) }
						<br />
					</p>
					<div
						style={ {
							width: 'fit-content',
							margin: '20px auto 0',
						} }
					>
						<Button
							variant="primary"
							onClick={ () => {
								if ( ! selectedStyleElm ) return;

								const newElementStyleObj = {
									...element_style_obj,
								};
								delete newElementStyleObj[ selectedStyleElm ];
								markdownSourceRefs.current.elementStyleObj =
									newElementStyleObj;
								setAttributes( {
									element_style_obj: newElementStyleObj,
								} );
								// 明示的なスタイル削除時だけMarkdownから再生成する
								setMarkdownRevision(
									( revision ) => revision + 1
								);
								// モーダルを閉じる
								closeModal();
							} }
						>
							{ __( 'Delete', 'markdown-block' ) }
						</Button>
						<Button
							variant="secondary"
							onClick={ closeModal }
							style={ { marginLeft: '10px' } }
						>
							{ __( 'Cancel', 'markdown-block' ) }
						</Button>
					</div>
				</Modal>
			) }
			{ isProgressModal && (
				<Modal
					title={ __( 'Copy Style Progress', 'markdown-block' ) }
					onRequestClose={ closeProgress }
				>
					<p>
						{ isStart
							? __( 'Processing, please wait.', 'markdown-block' )
							: __(
									'Please press the start processing button.',
									'markdown-block'
							  ) }
					</p>
					<UpdateAllPostsBlockAttributes
						postType={ selectedSlug.rest_base }
						blockName="itmar/markdown-block"
						newAttributes={ {
							element_style_obj: element_style_obj,
							backgroundColor: backgroundColor,
							backgroundGradient: backgroundGradient,
							default_val: default_val,
							mobile_val: mobile_val,
							radius_value: radius_value,
							border_value: border_value,
						} }
						onProcessStart={ startProgress }
						onProcessEnd={ closeProgress }
						onProcessCancel={ () => {
							dispatch( 'core/notices' ).createNotice(
								'error',
								__(
									'Processing was interrupted.',
									'markdown-block'
								),
								{ type: 'snackbar' }
							);
						} }
					/>
				</Modal>
			) }
			{ isMobile && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							//属性 isEditMode の値により表示するラベルを切り替え
							label={ isEditMode ? 'Preview' : 'Edit' }
							//属性 isEditMode の値により表示するアイコンを切り替え
							icon={ isEditMode ? 'format-image' : 'edit' }
							className="edit_mode"
							//setAttributes を使って属性の値を更新（真偽値を反転）
							onClick={ () => {
								setAttributes( { isEditMode: ! isEditMode } );
							} }
						/>
					</ToolbarGroup>
				</BlockControls>
			) }

			<div { ...blockProps }>
				<div className="area_wrapper">
					<div
						className={ `edit_area${
							! isEditMode ? ' isHide' : ''
						}` }
					>
						<EasyMDEEditor
							value={ mdContent }
							scrollRatio={ scrollRatio } // プレビューのスクロール割合を渡す
							onChange={ ( value: string ) =>
								setAttributes( { mdContent: value } )
							}
							onScroll={ ( editorScrollRatio: number ) =>
								handleScroll( editorScrollRatio )
							}
						/>
					</div>

					<div
						ref={ previewRef }
						className={ `preview_area${
							! isEditMode ? ' isShow' : ''
						}` }
						style={ blockStyle }
					>
						<InnerBlocks />
					</div>
				</div>
			</div>
		</>
	);
}
