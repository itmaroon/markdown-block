declare module '@wordpress/block-editor';
declare module '@wordpress/components';
declare module '@wordpress/data';

declare module '@wordpress/i18n' {
	export function __( text: string, domain?: string ): string;
}

declare module '@wordpress/element' {
	export function useState< T >(
		initialValue: T | ( () => T )
	): [ T, ( value: T | ( ( previous: T ) => T ) ) => void ];
	export function useRef< T >( initialValue: T ): { current: T };
	export function useEffect(
		effect: () => void | ( () => void ),
		dependencies?: readonly unknown[]
	): void;
}

declare module '@wordpress/api-fetch' {
	type ApiFetchOptions = {
		path: string;
		method?: string;
		headers?: Record< string, string >;
		body?: BodyInit;
	};

	export default function apiFetch< T = unknown >(
		options: ApiFetchOptions
	): Promise< T >;
}

declare module '@wordpress/blocks' {
	export function registerBlockType(
		name: string,
		settings: Record< string, unknown >
	): unknown;
	export function createBlocksFromInnerBlocksTemplate(
		template: unknown[]
	): unknown[];
}

declare module 'fast-deep-equal' {
	export default function equal( first: unknown, second: unknown ): boolean;
}

declare module 'marked' {
	export const marked: {
		parse: (
			markdown: string,
			options?: Record< string, unknown >
		) => string;
	};
}

declare module 'easymde' {
	const EasyMDE: new ( options: Record< string, unknown > ) => unknown;
	export default EasyMDE;
}

declare module 'jquery' {
	const jquery: JQueryStatic;
	export default jquery;
}

declare module 'itmar-block-packages';
declare module '*.scss';
declare module '*.css';
declare module '*.svg' {
	export const ReactComponent: (
		props: Record< string, unknown >
	) => JSX.Element;
	const source: string;
	export default source;
}

declare const markdown_block: {
	home_url: string;
};

interface JQueryStatic {
	( selector: unknown ): JQueryCollection;
	( callback: ( jquery: JQueryStatic ) => void ): void;
}
type JQueryCollection = any;

interface Window {
	itmar_markdown_option: {
		nonce: string;
	};
}

declare namespace JSX {
	interface Element {}
	interface IntrinsicElements {
		[ elementName: string ]: any;
	}
}
