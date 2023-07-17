
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import TocRender from './TocRender';
import { borderProperty, radiusProperty, marginProperty, paddingProperty } from './styleProperty';


export default function save({ attributes }) {
	const {
		mdContent,
		blockArray,
		element_style_obj,
		backgroundColor,
		backgroundGradient,
		margin_value,
		padding_value,
		radius_value,
		border_value,
		is_toc,
		toc_set_array
	} = attributes;

	//タイトルがブロックに含まれているか
	const titles_num = blockArray.filter(attr => attr[0] === "itmar/design-title").length;

	//単色かグラデーションかの選択
	const bgColor = backgroundColor || backgroundGradient;

	//ブロックのスタイル設定
	const margin_obj = marginProperty(margin_value);
	const padding_obj = paddingProperty(padding_value);
	const radius_obj = radiusProperty(radius_value);
	const border_obj = borderProperty(border_value);
	const blockStyle = { background: bgColor, ...margin_obj, ...padding_obj, ...radius_obj, ...border_obj };

	return (
		<div {...useBlockProps.save()}>
			{(titles_num > 0 && is_toc && toc_set_array.includes('header')) &&
				<div className='table-of-contents md_toc_header' style={{ background: bgColor }} >
					<TocRender
						attributes={blockArray}
					/>
				</div>
			}

			<div className='md_block_content' style={blockStyle}>
				<div className='main_md_content'>
					<InnerBlocks.Content />
				</div>

				{(titles_num > 0 && is_toc && toc_set_array.includes('sidebar')) &&
					<div className='side_md_content'>
						<div className='table-of-contents md_toc_sidebar' >
							<TocRender
								attributes={blockArray}
								style={{ background: bgColor }}
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
