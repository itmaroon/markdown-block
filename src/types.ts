export type AttributeRecord = Record< string, unknown >;

export type BlockTemplate = [
	name: string,
	attributes?: AttributeRecord,
	innerBlocks?: BlockTemplate[],
];

export interface EditorBlock {
	name: string;
	clientId: string;
	attributes: AttributeRecord;
	innerBlocks?: EditorBlock[];
}

export interface SpacingValues {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
	[ key: string ]: string | undefined;
}

export interface ResponsiveValues {
	margin: SpacingValues;
	padding: SpacingValues;
}

export interface MarkdownAttributes {
	[ key: string ]: unknown;
	mdContent?: string;
	blockArray: BlockTemplate[];
	element_style_obj: Record< string, AttributeRecord >;
	backgroundColor?: string;
	backgroundGradient?: string;
	default_val: ResponsiveValues;
	mobile_val: ResponsiveValues;
	radius_value: AttributeRecord;
	border_value?: AttributeRecord;
	is_toc: boolean;
	toc_set_array: string[];
	isEditMode: boolean;
}

export interface BlockEditProps {
	attributes: MarkdownAttributes;
	setAttributes: ( attributes: Partial< MarkdownAttributes > ) => void;
	clientId: string;
}

export interface BlockSaveProps {
	attributes: MarkdownAttributes;
}

export interface PostTypeInfo {
	slug?: string;
	rest_base?: string;
	[ key: string ]: unknown;
}

export type CssValue = string | number | undefined;
export type CssProperties = Record< string, CssValue >;
