
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

			<div className='md_block_content'>
				<div className='main_md_content'>
					<InnerBlocks.Content />
				</div>

				{(attributes.is_toc && attributes.toc_set_array.includes('sidebar')) &&
					<div className='side_md_content'>
						<div className='table-of-contents sidebar'>
							<TocRender
								attributes={attributes.blockArray}
							/>
						</div>
					</div>
				}

			</div>

		</div>

	);
}
