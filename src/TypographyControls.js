import { 
  PanelBody, 
  PanelRow, 
  RadioControl,
  ToggleControl, 
  __experimentalUnitControl as UnitControl, 
} from '@wordpress/components';

import Select from 'react-select';


const TypographyControls = ({ title, fontStyle, setAttributes }) => {
  const {
    fontSize,
    fontFamily,
    fontWeight,
    isItalic
  }=fontStyle;

  const fontFamilyOptions = [
    { value: 'Arial, sans-serif', label: 'Arial', fontFamily: 'Arial, sans-serif' },
    { value: 'Courier New, monospace', label: 'Courier New', fontFamily: 'Courier New, monospace' },
    { value: 'Georgia, serif', label: 'Georgia', fontFamily: 'Georgia, serif' },
    { label: 'Noto Sans JP', value: 'Noto Sans JP, sans-serif', fontFamily: 'Noto Sans JP, sans-serif'},
    { label: 'Texturina', value: 'Texturina, serif',fontFamily: 'Texturina, serif' },
  ];

  const units = [
    { value: 'px', label: 'px' },
    { value: 'em', label: 'em' },
    { value: 'rem', label: 'rem' },
  ];

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      fontFamily: state.data.fontFamily,
    }),
  };
  
  const FontSelect = ({label, value, onChange }) => (
    <>
      {label && <label className="components-base-control__label">{label}</label>}
      <Select
        options={fontFamilyOptions}
        value={fontFamilyOptions.find((option) => option.value === value)}
        onChange={(newValue) => {
          onChange(newValue.value);
        }}
        styles={customStyles}
      />
    </>
  );

  return (
    <PanelBody title={ title }>
      <UnitControl
        dragDirection="e"
        onChange={(newValue) =>{
          newValue = newValue != '' ? newValue : '0px'
          const newStyle = { ...fontStyle, fontSize: newValue};
          setAttributes({font_style_copy: newStyle});
        }} 
        label='サイズ' 
        value={ fontSize }
        units={units} 
      />

      <FontSelect
        label = "フォントファミリー"
        value={fontFamily}
        onChange={ (newValue) =>{
          const newStyle = { ...fontStyle, fontFamily: newValue};
          setAttributes({font_style_copy: newStyle});
        }}
      />

      <label className="components-base-control__label">フォントウエイト</label>
      <PanelRow className='itmar_weight_row'>
        <RadioControl
          selected={ fontWeight }
          options={ [
            { label: 'LIGHT', value: "300" },
            { label: 'REGULAR', value: "400" },
            { label: 'MEDIUM', value: "500" },
            { label: 'S-BOLD', value: "600" },
            { label: 'BOLD', value: "700" },
            { label: 'BLACK', value: "900" },
          ] }
          onChange={(newValue) =>{
            const newStyle = { ...fontStyle, fontWeight: newValue};
            setAttributes({font_style_copy: newStyle});
          }}
        />
      </PanelRow>

      <label className="components-base-control__label">斜体表示</label>
      <ToggleControl
        checked={isItalic}
        onChange={(newValue) =>{
          const newStyle = { ...fontStyle, isItalic: newValue};
          setAttributes({font_style_copy: newStyle});
        }}
      />
    </PanelBody>
  );
};
export default TypographyControls;
