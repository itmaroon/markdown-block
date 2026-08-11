import { useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import EasyMDE from 'easymde';

interface CodeMirrorPosition {
	line: number;
	ch: number;
}

interface CodeMirrorScrollInfo {
	top: number;
	height: number;
	clientHeight: number;
}

interface CodeMirrorEditor {
	getCursor: () => CodeMirrorPosition;
	setCursor: ( position: CodeMirrorPosition ) => void;
	replaceRange: ( value: string, position: CodeMirrorPosition ) => void;
	coordsChar: ( position: {
		left: number;
		top: number;
	} ) => CodeMirrorPosition;
	getScrollInfo: () => CodeMirrorScrollInfo;
	scrollTo: ( left: number | null, top: number ) => void;
	on: ( eventName: string, handler: ( ...args: unknown[] ) => void ) => void;
	off: ( eventName: string, handler: ( ...args: unknown[] ) => void ) => void;
}

interface EasyMDEInstance {
	codemirror: CodeMirrorEditor;
	dropPosition: CodeMirrorPosition | null;
	value: ( nextValue?: string ) => string;
	toTextArea: () => void;
}

interface MediaResponse {
	source_url?: string;
}

interface EasyMDEEditorProps {
	value?: string;
	scrollRatio: number;
	onChange: ( value: string ) => void;
	onScroll: ( ratio: number ) => void;
}

interface EditorRef {
	current: EasyMDEInstance | null;
}

const uploadImage = ( file: File, editorRef: EditorRef ): void => {
	const nonce = window.itmar_markdown_option.nonce;
	const formData = new FormData();
	formData.append( 'file', file );

	apiFetch< MediaResponse >( {
		path: '/wp/v2/media',
		method: 'POST',
		headers: {
			'X-WP-Nonce': nonce,
		},
		body: formData,
	} )
		.then( ( data ) => {
			if ( ! data?.source_url ) {
				throw new Error( 'Invalid response from server' );
			}

			const editorInstance = editorRef.current;
			if ( ! editorInstance ) {
				return;
			}

			const markDownImg = `\n![image](${ data.source_url })\n`;
			const codeMirror = editorInstance.codemirror;
			const insertPosition =
				editorInstance.dropPosition || codeMirror.getCursor();

			codeMirror.setCursor( insertPosition );
			codeMirror.replaceRange( markDownImg, insertPosition );
			editorInstance.dropPosition = null;
		} )
		.catch( ( error ) => {
			window.console.error( 'Upload failed:', error );
		} );
};

const EasyMDEEditor = ( {
	value,
	scrollRatio,
	onChange,
	onScroll,
}: EasyMDEEditorProps ) => {
	const textareaRef = useRef< HTMLTextAreaElement | null >( null );
	const editorRef = useRef< EasyMDEInstance | null >( null );
	const isSyncingScroll = useRef( false );
	const isApplyingExternalValue = useRef( false );
	const callbacksRef = useRef( { onChange, onScroll } );

	useEffect( () => {
		callbacksRef.current = { onChange, onScroll };
	}, [ onChange, onScroll ] );

	useEffect( () => {
		if ( ! textareaRef.current || editorRef.current ) {
			return;
		}

		const editorInstance = new EasyMDE( {
			element: textareaRef.current,
			spellChecker: false,
			uploadImage: true,
			imageUploadFunction: ( file: File ) =>
				uploadImage( file, editorRef ),
			toolbar: [
				'undo',
				'redo',
				'|',
				'bold',
				'italic',
				'heading',
				'|',
				'code',
				'quote',
				'link',
				'image',
				'unordered-list',
				'ordered-list',
				'table',
				'|',
				'guide',
			],
		} ) as EasyMDEInstance;
		editorInstance.dropPosition = null;
		editorRef.current = editorInstance;

		const handleEditorScroll = () => {
			if ( isSyncingScroll.current ) {
				return;
			}
			isSyncingScroll.current = true;

			const scrollInfo = editorInstance.codemirror.getScrollInfo();
			const scrollHeight = scrollInfo.height - scrollInfo.clientHeight;
			const nextScrollRatio =
				scrollHeight > 0 ? scrollInfo.top / scrollHeight : 0;
			callbacksRef.current.onScroll( nextScrollRatio );

			window.requestAnimationFrame( () => {
				isSyncingScroll.current = false;
			} );
		};

		const handleDrop = (
			codeMirrorValue: unknown,
			eventValue: unknown
		) => {
			const codeMirror = codeMirrorValue as CodeMirrorEditor;
			const event = eventValue as DragEvent;
			event.preventDefault();
			editorInstance.dropPosition = codeMirror.coordsChar( {
				left: event.clientX,
				top: event.clientY,
			} );
		};

		const handleChange = () => {
			if ( isApplyingExternalValue.current ) {
				return;
			}
			callbacksRef.current.onChange( editorInstance.value() );
		};

		editorInstance.codemirror.on( 'scroll', handleEditorScroll );
		editorInstance.codemirror.on( 'drop', handleDrop );
		editorInstance.codemirror.on( 'change', handleChange );

		return () => {
			editorInstance.codemirror.off( 'scroll', handleEditorScroll );
			editorInstance.codemirror.off( 'drop', handleDrop );
			editorInstance.codemirror.off( 'change', handleChange );
			if ( editorRef.current === editorInstance ) {
				editorRef.current = null;
			}
			editorInstance.toTextArea();
		};
	}, [] );

	// 属性の外部更新（Undo、複製、投稿切替など）をエディタへ反映する
	useEffect( () => {
		const editorInstance = editorRef.current;
		const nextValue = value || '';
		if ( ! editorInstance || editorInstance.value() === nextValue ) {
			return;
		}

		isApplyingExternalValue.current = true;
		editorInstance.value( nextValue );
		isApplyingExternalValue.current = false;
	}, [ value ] );

	// プレビュー側のスクロール位置をエディタへ反映する
	useEffect( () => {
		const editorInstance = editorRef.current;
		if ( ! editorInstance || isSyncingScroll.current ) {
			return;
		}

		isSyncingScroll.current = true;
		const scrollInfo = editorInstance.codemirror.getScrollInfo();
		const editorScrollHeight = scrollInfo.height - scrollInfo.clientHeight;
		editorInstance.codemirror.scrollTo(
			null,
			Math.max( 0, editorScrollHeight ) * scrollRatio
		);

		window.requestAnimationFrame( () => {
			isSyncingScroll.current = false;
		} );
	}, [ scrollRatio ] );

	return <textarea ref={ textareaRef } defaultValue={ value || '' } />;
};

export default EasyMDEEditor;
