
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import TocRender from './TocRender';


export default function save({ attributes }) {
	const titles_num = attributes.blockArray.filter(attr => attr[0] === "itmar/design-title").length;//タイトルがブロックに含まれているか

	return (
		<div {...useBlockProps.save()}>
			{(titles_num > 0 && attributes.is_toc && attributes.toc_set_array.includes('header')) &&
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

				{(titles_num > 0 && attributes.is_toc && attributes.toc_set_array.includes('sidebar')) &&
					<div className='side_md_content'>
						<div className='table-of-contents sidebar'>
							<TocRender
								attributes={attributes.blockArray}
							/>
						</div>

					</div>
				}

				<div class="drawer_icon" id="itmar_mdBlock_hanberger">
					<div class="drawer_icon_bars">
						<div class="drawer_icon_bar1"></div>
						<div class="drawer_icon_bar2"></div>
						<div class="drawer_icon_bar3"></div>
					</div>
				</div>

				<div class="drawer_background" id="itmar_mdBlock_drawer_background">
				</div>
			</div>

		</div>

	);
}
