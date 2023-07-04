
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import TocRender from './TocRender';


export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			{(attributes.is_toc && attributes.toc_set_array.includes('header')) &&
				<div className='table-of-contents header'>
					<TocRender
						attributes={attributes.blockArray}
					/>
				</div>
			}

			{(attributes.is_toc && attributes.toc_set_array.includes('sidebar')) &&
				<div className='table-of-contents sidebar'>
					<TocRender
						attributes={attributes.blockArray}
					/>
				</div>
			}

			<InnerBlocks.Content />

		</div>

	);
}
