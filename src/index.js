
import { registerBlockType } from '@wordpress/blocks';
import { ReactComponent as Markdown } from './markdown.svg';

import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';


registerBlockType(metadata.name, {
	icon: <Markdown />,
	edit: Edit,
	save,
});
