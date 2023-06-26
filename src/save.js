
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import TocRender from './TocRender';


export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<div className='table-of-contents'>
				< TocRender
					attributes={attributes.blockArray}
				/>
			</div>
			<InnerBlocks.Content />

		</div>

	);
}
