/**
 * コアブロックカスタマイズ高階コンポーネント
 *
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
  InspectorControls,
  __experimentalBorderRadiusControl as BorderRadiusControl
} from '@wordpress/block-editor';

import {
  Button,
  Panel,
  PanelBody,
  PanelRow,
  ToggleControl,
  RangeControl,
  RadioControl,
  TextControl,
  __experimentalBoxControl as BoxControl,
  __experimentalUnitControl as UnitControl,
  __experimentalBorderBoxControl as BorderBoxControl
} from '@wordpress/components';

import { borderProperty } from './styleProperty';

// カスタマイズ対象とするブロック
const allowedBlocks = ['core/paragraph', 'core/list', 'core/image', 'core/quote', 'core/table'];

//block登録フック（カスタム属性の追加）
function addLineHeightAttribute(settings, name) {
  if (allowedBlocks.includes(name)) {
    let newAttributes = {};
    newAttributes = {
      margin_val: {
        type: "object",
        default: {
          top: "1em",
          left: "1em",
          bottom: "1em",
          right: "1em"
        }
      },
      padding_val: {
        type: "object",
        default: {
          top: "1em",
          left: "1em",
          bottom: "1em",
          right: "1em"
        }
      }
    };
    if (name === 'core/paragraph' || name === 'core/list' || name === 'core/quote') {
      newAttributes = {
        ...newAttributes,
        lineHeight: {
          type: 'number',
          default: 1.6,
        },

      };
    }

    if (name === 'core/list' || name === 'core/quote') {
      newAttributes = {
        ...newAttributes,
        radius_list: {
          type: "object",
          default: {
            topLeft: "0px",
            topRight: "0px",
            bottomRight: "0px",
            bottomLeft: "0px",
            value: "0px"
          }
        },
        border_list: {
          type: "object"
        },

      };
    }

    if (name === 'core/list') {
      newAttributes = {
        ...newAttributes,
        list_type: {
          type: "string",
          default: "UL"
        },
      };
    }

    return lodash.assign({}, settings, {
      attributes: lodash.assign({}, settings.attributes, newAttributes),
    });
  }

  //その他のブロック
  return settings;;
}

addFilter(
  'blocks.registerBlockType',
  'block-collections/add-attribute',
  addLineHeightAttribute
);

//BlockEditカスタムフック（インスペクターの追加）
const withInspectorControl = createHigherOrderComponent((BlockEdit) => {
  //スペースのリセットバリュー
  const padding_resetValues = {
    top: '1em',
    left: '1em',
    right: '1em',
    bottom: '1em',
  }

  const units = [
    { value: 'px', label: 'px' },
    { value: 'em', label: 'em' },
    { value: 'rem', label: 'rem' },
  ];

  return (props) => {
    if (props.attributes.className === 'itmar_md_block') {//markdown-block内のブロックに限定
      if (allowedBlocks.includes(props.name)) {
        const {
          lineHeight,
          margin_val,
          padding_val,
          border_list,
          radius_list
        } = props.attributes;
        const setAttributes = props.setAttributes;
        return (
          <>
            <BlockEdit {...props} />

            <InspectorControls group="styles">
              <PanelBody title="間隔設定" initialOpen={false}>
                <BoxControl
                  label="マージン設定"
                  values={margin_val}
                  onChange={newValue => setAttributes({ margin_val: newValue })}
                  units={units}	// 許可する単位
                  allowReset={true}	// リセットの可否
                  resetValues={padding_resetValues}	// リセット時の値

                />

                <BoxControl
                  label="パティング設定"
                  values={padding_val}
                  onChange={newValue => setAttributes({ padding_val: newValue })}
                  units={units}	// 許可する単位
                  allowReset={true}	// リセットの可否
                  resetValues={padding_resetValues}	// リセット時の値

                />

              </PanelBody>
              {(props.name === 'core/paragraph' || props.name === 'core/list' || props.name === 'core/quote') &&
                <>
                  <PanelBody title="行間設定">
                    <RangeControl
                      value={lineHeight}
                      label="lineHeight"
                      max={3}
                      min={1}
                      step={.1}
                      onChange={(val) => setAttributes({ lineHeight: val })}
                      withInputField={true}
                    />
                  </PanelBody>

                </>
              }
              {(props.name === 'core/list' || props.name === 'core/quote') &&
                <PanelBody title="ボーダー設定" initialOpen={false} className="border_design_ctrl">
                  <BorderBoxControl
                    colors={[{ color: '#72aee6' }, { color: '#000' }, { color: '#fff' }]}
                    onChange={(newValue) => setAttributes({ border_list: newValue })}
                    value={border_list}

                  />
                  <BorderRadiusControl
                    values={radius_list}
                    onChange={(newBrVal) =>
                      setAttributes({ radius_list: typeof newBrVal === 'string' ? { "value": newBrVal } : newBrVal })}
                  />
                </PanelBody>
              }

            </InspectorControls>
          </>
        );
      }
    }
    //その他のブロック
    return <BlockEdit {...props} />;
  };
}, 'withInspectorControl');

addFilter('editor.BlockEdit', 'block-collections/with-inspector-control', withInspectorControl);

//BlockListBlockフック（編集画面のブロックの外観等の反映）
const applyExtraAttributesInEditor = createHigherOrderComponent((BlockListBlock) => {
  return (props) => {
    //propsを展開
    const {
      attributes,
      name,
      isValid,
      wrapperProps
    } = props;

    if (attributes.className === 'itmar_md_block') {//markdown-block内のブロックに限定
      if (allowedBlocks.includes(name)) {
        if (isValid) {
          //属性の取り出し
          const {
            lineHeight,
            margin_val,
            padding_val,
            radius_list,
            border_list
          } = attributes;

          //拡張したスタイル

          let extraStyle = {};
          extraStyle = {
            margin: `${margin_val.top} ${margin_val.right} ${margin_val.bottom} ${margin_val.left}`,
            padding: `${padding_val.top} ${padding_val.right} ${padding_val.bottom} ${padding_val.left}`,
          }
          if (name === 'core/paragraph' || name === 'core/list' || name === 'core/quote') {
            extraStyle = {
              ...extraStyle, lineHeight: lineHeight,
            }
          }

          if (name === 'core/list' || name === 'core/quote') {
            //角丸の設定
            const list_radius_prm = (radius_list && Object.keys(radius_list).length === 1) ? radius_list.value : `${(radius_list && radius_list.topLeft) || ''} ${(radius_list && radius_list.topRight) || ''} ${(radius_list && radius_list.bottomRight) || ''} ${(radius_list && radius_list.bottomLeft) || ''}`
            const list_border = borderProperty(border_list);
            extraStyle = {
              ...extraStyle, borderRadius: list_radius_prm, ...list_border
            }
          }

          if (name === 'core/image') {
            if (attributes.align === 'center') {//中央ぞろえの時
              extraStyle = {
                ...extraStyle, margin: `${margin_val.top} auto ${margin_val.bottom}`
              }
            }
          }

          //既存スタイルとマージ
          let blockWrapperProps = wrapperProps;
          blockWrapperProps = {
            ...blockWrapperProps,
            style: {
              ...(blockWrapperProps && { ...blockWrapperProps.style }),
              ...extraStyle
            },
          };

          return (
            <BlockListBlock {...props}
              wrapperProps={blockWrapperProps}
            />
          );
        }
      }
    }

    //デフォルト
    return (
      <BlockListBlock {...props} />
    );

  };
}, 'applyExtraAttributesInEditor');

addFilter(
  'editor.BlockListBlock',
  'block-collections/extra-attributes-in-editor',
  applyExtraAttributesInEditor,
);

//blocks.getSaveContent.extraPropsフック（フロントエンドへの反映）
const applyExtraAttributesInFrontEnd = (props, blockType, attributes) => {
  if (props.className?.match(/itmar_md_block/)) {//markdown-block内のブロックに限定
    if (allowedBlocks.includes(blockType.name)) {
      //属性の取り出し
      const {
        lineHeight,
        margin_val,
        padding_val,
        radius_list,
        border_list,
      } = attributes;

      //拡張したスタイル
      let extraStyle = {};
      extraStyle = {
        margin: `${margin_val.top} ${margin_val.right} ${margin_val.bottom} ${margin_val.left}`,
        padding: `${padding_val.top} ${padding_val.right} ${padding_val.bottom} ${padding_val.left}`,
      }
      if (blockType.name === 'core/paragraph' || blockType.name === 'core/list' || blockType.name === 'core/quote') {
        extraStyle = {
          ...extraStyle, lineHeight: lineHeight,
        }
      }

      if (blockType.name === 'core/list' || blockType.name === 'core/quote') {
        //角丸の設定
        const list_radius_prm = (radius_list && Object.keys(radius_list).length === 1) ? radius_list.value : `${(radius_list && radius_list.topLeft) || ''} ${(radius_list && radius_list.topRight) || ''} ${(radius_list && radius_list.bottomRight) || ''} ${(radius_list && radius_list.bottomLeft) || ''}`
        //ボーダーの設定
        const list_border = borderProperty(border_list);

        extraStyle = {
          ...extraStyle, borderRadius: list_radius_prm, ...list_border
        }
      }

      if (blockType.name === 'core/image') {
        if (attributes.align === 'center') {//中央ぞろえの時
          extraStyle = {
            ...extraStyle, margin: `${margin_val.top} auto ${margin_val.bottom}`
          }
        }
      }

      return Object.assign(props, { style: { ...props.style, ...extraStyle } });
    }
  }
  //デフォルト
  return props;
}

addFilter(
  'blocks.getSaveContent.extraProps',
  'block-collections/-extra-attributes-in-front-end',
  applyExtraAttributesInFrontEnd,
);
