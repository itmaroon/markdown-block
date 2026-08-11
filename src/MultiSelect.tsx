import { CheckboxControl, ColorPicker } from '@wordpress/components';

import { useState } from '@wordpress/element';

interface SelectOption {
	title: string;
	value: string;
}

interface PickerColor {
	hex: string;
}

interface MultiSelectProps {
	stockArrayName: string;
	stokArray: string[];
	type: 'checkBox' | 'colorPicker';
	option: SelectOption[];
	setAttributes: ( attributes: Record< string, unknown > ) => void;
}

const MultiSelect = ( {
	stockArrayName,
	stokArray,
	type,
	option,
	setAttributes,
}: MultiSelectProps ) => {
	//チェックボックスクリック時にstokArrayの内容を書き換え
	const handleOptionChange = ( optionValue: string, checked: boolean ) => {
		if ( checked ) {
			setAttributes( {
				[ stockArrayName ]: [ ...stokArray, optionValue ],
			} );
		} else {
			setAttributes( {
				[ stockArrayName ]: stokArray.filter(
					( value ) => value !== optionValue
				),
			} );
		}
	};

	//選択されたColorItemの色を保持する状態変数
	const [ activeColorIndex, setActiveColorIndex ] = useState< number | null >(
		null
	);
	//ColorItemがクリックされたときの処理
	const handleColorItemClick = ( index: number ) => {
		//同じ色見本が押されたらピッカーを消す
		setActiveColorIndex( index === activeColorIndex ? null : index );
	};
	//ColorPickerで色が設定されたときの処理
	const handleColorPickerChange = ( color: PickerColor ) => {
		if ( activeColorIndex === null ) {
			return;
		}

		let updatedArray: string[];
		if ( activeColorIndex >= stokArray.length ) {
			updatedArray = [ ...stokArray, color.hex ];
		} else {
			updatedArray = [ ...stokArray ];
			updatedArray[ activeColorIndex ] = color.hex;
		}

		setAttributes( { [ stockArrayName ]: updatedArray } );
	};
	//ColorDeleteがクリックされたときの処理
	const handleColorDelete = ( indexToRemove: number ) => {
		setAttributes( {
			[ stockArrayName ]: stokArray.filter(
				( _item, index ) => index !== indexToRemove
			),
		} );
	};
	//ColorPlusがクリックされたときの処理
	const handleColorAdd = () => {
		setActiveColorIndex( stokArray.length );
	};

	return (
		<div>
			{ type === 'checkBox' &&
				option.map( ( label, index ) => {
					return (
						<CheckboxControl
							key={ index }
							label={ label.title }
							checked={ stokArray.includes( label.value ) }
							onChange={ ( checked: boolean ) =>
								handleOptionChange( label.value, checked )
							}
						/>
					);
				} ) }
			{ type === 'colorPicker' && (
				<>
					{ stokArray.map( ( color, index ) => (
						<div
							className="color_item"
							key={ `${ color }-${ index }` }
						>
							{ index == activeColorIndex && (
								<div
									className="color_circle checked"
									style={ { backgroundColor: color } }
									onClick={ () =>
										handleColorItemClick( index )
									}
								></div>
							) }
							{ index != activeColorIndex && (
								<div
									className="color_circle"
									style={ { backgroundColor: color } }
									onClick={ () =>
										handleColorItemClick( index )
									}
								></div>
							) }
							<div
								className="color_delete"
								onClick={ () => handleColorDelete( index ) }
							></div>
						</div>
					) ) }
					<div
						className="color_item color_plus"
						onClick={ () => handleColorAdd() }
					></div>
					{ activeColorIndex !== null && (
						<ColorPicker
							color={ stokArray[ activeColorIndex ] }
							onChangeComplete={ handleColorPickerChange }
						/>
					) }
				</>
			) }
		</div>
	);
};

export default MultiSelect;
