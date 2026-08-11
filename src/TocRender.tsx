import type { BlockTemplate, CssProperties } from './types';

interface TocRenderProps {
	attributes: BlockTemplate[];
	style?: CssProperties;
}

const TocRender = ( { attributes, style }: TocRenderProps ) => (
	<div className="toc_section">
		<h2>
			Table of Content
			<div className="btn_open"></div>
		</h2>

		<ul style={ style }>
			{ attributes
				.filter(
					( attribute ) => attribute[ 0 ] === 'itmar/design-title'
				)
				.map( ( attribute, index ) => {
					const blockAttributes = attribute[ 1 ] || {};
					const headingType = String(
						blockAttributes.headingType || 'H2'
					);
					const headingId = String(
						blockAttributes.headingID || `toc-${ index + 1 }`
					);

					return (
						<li key={ headingId }>
							<a
								href={ `#${ headingId }` }
								className={ `lv-${ headingType.slice( 1 ) }` }
							>
								{ String(
									blockAttributes.headingContent || ''
								) }
							</a>
						</li>
					);
				} ) }
		</ul>
	</div>
);

export default TocRender;
