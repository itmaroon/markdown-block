/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/styleProperty.js":
/*!******************************!*\
  !*** ./src/styleProperty.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   borderProperty: () => (/* binding */ borderProperty),
/* harmony export */   marginProperty: () => (/* binding */ marginProperty),
/* harmony export */   paddingProperty: () => (/* binding */ paddingProperty),
/* harmony export */   radiusProperty: () => (/* binding */ radiusProperty)
/* harmony export */ });
// sideの最初の文字を大文字にする関数
const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
function borderProperty(borderObj) {
  if (borderObj) {
    //borderObjがundefinedでない
    let keys = ['top', 'bottom', 'left', 'right'];
    let ret_prop = null;
    let doesKeyExist = keys.some(key => key in borderObj);
    if (doesKeyExist) {
      //'top', 'bottom', 'left', 'right'が別設定
      let cssObj = {};
      for (let side in borderObj) {
        const sideData = borderObj[side];
        const startsWithZero = String(sideData.width || '').match(/^0/);
        if (startsWithZero) {
          //widthが０ならCSS設定しない
          continue;
        }
        const border_style = sideData.style || 'solid';
        let camelCaseSide = `border${capitalizeFirstLetter(side)}`;
        cssObj[camelCaseSide] = `${sideData.width} ${border_style} ${sideData.color}`;
      }
      ret_prop = cssObj;
      return ret_prop;
    } else {
      //同一のボーダー
      const startsWithZero = String(borderObj.width || '').match(/^0/);
      if (startsWithZero) {
        //widthが０ならnullを返す
        return null;
      }
      const border_style = borderObj.style || 'solid';
      ret_prop = {
        border: `${borderObj.width} ${border_style} ${borderObj.color}`
      };
      return ret_prop;
    }
  } else {
    return null;
  }
}

//角丸の設定
function radiusProperty(radiusObj) {
  const ret_prop = radiusObj && Object.keys(radiusObj).length === 1 ? radiusObj.value : `${radiusObj && radiusObj.topLeft || ''} ${radiusObj && radiusObj.topRight || ''} ${radiusObj && radiusObj.bottomRight || ''} ${radiusObj && radiusObj.bottomLeft || ''}`;
  const ret_val = {
    borderRadius: ret_prop
  };
  return ret_val;
}

//マージンの設定
function marginProperty(marginObj) {
  const ret_prop = `${marginObj.top} ${marginObj.right} ${marginObj.bottom} ${marginObj.left}`;
  const ret_val = {
    margin: ret_prop
  };
  return ret_val;
}
//パディングの設定
function paddingProperty(paddingObj) {
  const ret_prop = `${paddingObj.top} ${paddingObj.right} ${paddingObj.bottom} ${paddingObj.left}`;
  const ret_val = {
    padding: ret_prop
  };
  return ret_val;
}

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/extends.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/extends.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _extends)
/* harmony export */ });
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./src/gutenberg-ex.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _styleProperty__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./styleProperty */ "./src/styleProperty.js");


/**
 * コアブロックカスタマイズ高階コンポーネント
 *
 */







// カスタマイズ対象とするブロック
const allowedBlocks = ['core/paragraph', 'core/list', 'core/image', 'core/quote', 'core/table'];

//block登録フック（カスタム属性の追加）
function addExSettings(settings, name) {
  if (allowedBlocks.includes(name)) {
    let newAttributes = {};
    let newStyles = [];
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
          default: 1.6
        }
      };
    }
    if (name === 'core/list' || name === 'core/quote' || name === 'core/table') {
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
        }
      };
    }
    if (name === 'core/list') {
      newAttributes = {
        ...newAttributes,
        list_type: {
          type: "string",
          default: "UL"
        }
      };
    }
    if (name === 'core/table') {
      newStyles = [...(settings.styles || []),
      // 既存のスタイルを保持
      {
        name: 'gradient',
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Gradient', 'itmar_block_collections'),
        isDefault: false
      }];
    }
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        ...newAttributes
      },
      styles: newStyles.length ? newStyles : settings.styles // 新しいスタイルがある場合にのみ上書き
    };
  }

  //その他のブロック
  return settings;
}
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.addFilter)('blocks.registerBlockType', 'itmar-ex-block/add-setting', addExSettings);

//BlockEditカスタムフック（インスペクターの追加）
const withInspectorControl = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__.createHigherOrderComponent)(BlockEdit => {
  //スペースのリセットバリュー
  const padding_resetValues = {
    top: '1em',
    left: '1em',
    right: '1em',
    bottom: '1em'
  };
  const units = [{
    value: 'px',
    label: 'px'
  }, {
    value: 'em',
    label: 'em'
  }, {
    value: 'rem',
    label: 'rem'
  }];
  return props => {
    const classNames = props.attributes.className ? props.attributes.className.split(' ') : [];
    const hasItmarBlockClass = classNames.includes('itmar_ex_block');
    if (hasItmarBlockClass) {
      //itmar_ex_blockをクラス名に持つブロックに限定

      if (allowedBlocks.includes(props.name)) {
        const {
          lineHeight,
          margin_val,
          padding_val,
          border_list,
          radius_list
        } = props.attributes;
        const setAttributes = props.setAttributes;
        return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockEdit, props), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_5__.InspectorControls, {
          group: "styles"
        }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelBody, {
          title: "\u9593\u9694\u8A2D\u5B9A",
          initialOpen: false
        }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.__experimentalBoxControl, {
          label: "\u30DE\u30FC\u30B8\u30F3\u8A2D\u5B9A",
          values: margin_val,
          onChange: newValue => setAttributes({
            margin_val: newValue
          }),
          units: units // 許可する単位
          ,
          allowReset: true // リセットの可否
          ,
          resetValues: padding_resetValues // リセット時の値
        }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.__experimentalBoxControl, {
          label: "\u30D1\u30C6\u30A3\u30F3\u30B0\u8A2D\u5B9A",
          values: padding_val,
          onChange: newValue => setAttributes({
            padding_val: newValue
          }),
          units: units // 許可する単位
          ,
          allowReset: true // リセットの可否
          ,
          resetValues: padding_resetValues // リセット時の値
        })), (props.name === 'core/paragraph' || props.name === 'core/list' || props.name === 'core/quote') && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelBody, {
          title: "\u884C\u9593\u8A2D\u5B9A"
        }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.RangeControl, {
          value: lineHeight,
          label: "lineHeight",
          max: 3,
          min: 1,
          step: .1,
          onChange: val => setAttributes({
            lineHeight: val
          }),
          withInputField: true
        }))), (props.name === 'core/list' || props.name === 'core/quote' || props.name === 'core/table') && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelBody, {
          title: "\u30DC\u30FC\u30C0\u30FC\u8A2D\u5B9A",
          initialOpen: false,
          className: "border_design_ctrl"
        }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.__experimentalBorderBoxControl, {
          colors: [{
            color: '#72aee6'
          }, {
            color: '#000'
          }, {
            color: '#fff'
          }],
          onChange: newValue => setAttributes({
            border_list: newValue
          }),
          value: border_list
        }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_5__.__experimentalBorderRadiusControl, {
          values: radius_list,
          onChange: newBrVal => setAttributes({
            radius_list: typeof newBrVal === 'string' ? {
              "value": newBrVal
            } : newBrVal
          })
        }))));
      }
    }
    //その他のブロック
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockEdit, props);
  };
}, 'withInspectorControl');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.addFilter)('editor.BlockEdit', 'itmar-ex-block/with-inspector-control', withInspectorControl);

//BlockListBlockフック（編集画面のブロックの外観等の反映）
const applyExtraAttributesInEditor = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__.createHigherOrderComponent)(BlockListBlock => {
  return props => {
    //propsを展開
    const {
      attributes,
      name,
      isValid,
      wrapperProps
    } = props;
    const classNames = props.attributes.className ? props.attributes.className.split(' ') : [];
    const hasItmarBlockClass = classNames.includes('itmar_ex_block');
    if (hasItmarBlockClass) {
      //itmar_ex_blockをクラス名に持つブロックに限定
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
            padding: `${padding_val.top} ${padding_val.right} ${padding_val.bottom} ${padding_val.left}`
          };
          if (name === 'core/paragraph' || name === 'core/list' || name === 'core/quote') {
            extraStyle = {
              ...extraStyle,
              lineHeight: lineHeight
            };
          }
          if (name === 'core/list' || name === 'core/quote') {
            //角丸の設定
            const list_radius_prm = radius_list && Object.keys(radius_list).length === 1 ? radius_list.value : `${radius_list && radius_list.topLeft || ''} ${radius_list && radius_list.topRight || ''} ${radius_list && radius_list.bottomRight || ''} ${radius_list && radius_list.bottomLeft || ''}`;
            const list_border = (0,_styleProperty__WEBPACK_IMPORTED_MODULE_7__.borderProperty)(border_list);
            extraStyle = {
              ...extraStyle,
              borderRadius: list_radius_prm,
              ...list_border
            };
          }
          if (name === 'core/image') {
            if (attributes.align === 'center') {
              //中央ぞろえの時
              extraStyle = {
                ...extraStyle,
                margin: `${margin_val.top} auto ${margin_val.bottom}`
              };
            }
          }
          if (name === 'core/table') {
            const list_border = (0,_styleProperty__WEBPACK_IMPORTED_MODULE_7__.borderProperty)(border_list);
            extraStyle = {
              ...extraStyle,
              borderCollapse: 'collapse',
              ...list_border
            };
          }

          //既存スタイルとマージ
          let blockWrapperProps = wrapperProps;
          blockWrapperProps = {
            ...blockWrapperProps,
            style: {
              ...(blockWrapperProps && {
                ...blockWrapperProps.style
              }),
              ...extraStyle
            }
          };
          return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
            wrapperProps: blockWrapperProps
          }));
        }
      }
    }

    //デフォルト
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, props);
  };
}, 'applyExtraAttributesInEditor');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.addFilter)('editor.BlockListBlock', 'block-collections/extra-attributes-in-editor', applyExtraAttributesInEditor);

//blocks.getSaveContent.extraPropsフック（フロントエンドへの反映）
const applyExtraAttributesInFrontEnd = (props, blockType, attributes) => {
  if (props.className?.match(/itmar_ex_block/)) {
    //markdown-block内のブロックに限定
    if (allowedBlocks.includes(blockType.name)) {
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
        padding: `${padding_val.top} ${padding_val.right} ${padding_val.bottom} ${padding_val.left}`
      };
      if (blockType.name === 'core/paragraph' || blockType.name === 'core/list' || blockType.name === 'core/quote') {
        extraStyle = {
          ...extraStyle,
          lineHeight: lineHeight
        };
      }
      if (blockType.name === 'core/list' || blockType.name === 'core/quote') {
        //角丸の設定
        const list_radius_prm = radius_list && Object.keys(radius_list).length === 1 ? radius_list.value : `${radius_list && radius_list.topLeft || ''} ${radius_list && radius_list.topRight || ''} ${radius_list && radius_list.bottomRight || ''} ${radius_list && radius_list.bottomLeft || ''}`;
        //ボーダーの設定
        const list_border = (0,_styleProperty__WEBPACK_IMPORTED_MODULE_7__.borderProperty)(border_list);
        extraStyle = {
          ...extraStyle,
          borderRadius: list_radius_prm,
          ...list_border
        };
      }
      if (blockType.name === 'core/image') {
        if (attributes.align === 'center') {
          //中央ぞろえの時
          extraStyle = {
            ...extraStyle,
            margin: `${margin_val.top} auto ${margin_val.bottom}`
          };
        }
      }
      return Object.assign(props, {
        style: {
          ...props.style,
          ...extraStyle
        }
      });
    }
  }
  //デフォルト
  return props;
};
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.addFilter)('blocks.getSaveContent.extraProps', 'block-collections/-extra-attributes-in-front-end', applyExtraAttributesInFrontEnd);
})();

/******/ })()
;
//# sourceMappingURL=gutenberg-ex.js.map