"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withOneOfBool = undefined;

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _modifiers = require("./modifiers");

Object.defineProperty(exports, "withOneOfBool", {
  enumerable: true,
  get: function get() {
    return _modifiers.withOneOfBool;
  }
});
exports.default = withPropsCombinations;
exports.createCombinationProps = createCombinationProps;
exports.getFieldTextForSymbol = getFieldTextForSymbol;
exports.stateLabel = stateLabel;
exports.createSymbol = createSymbol;
exports.setDefaults = setDefaults;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _objectHash = require("object-hash");

var _objectHash2 = _interopRequireDefault(_objectHash);

var _utils = require("./utils");

var _CombinationRenderer = require("./CombinationRenderer");

var _CombinationRenderer2 = _interopRequireDefault(_CombinationRenderer);

var _ErrorDisplay = require("./ErrorDisplay");

var _ErrorDisplay2 = _interopRequireDefault(_ErrorDisplay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var checkForMissingProps = function checkForMissingProps(component, possibleValuesByPropName) {
  if (typeof component === "string") {
    return new Error("mustProvideAllProps option is not supported for built-in components");
  }

  var componentProps = (0, _keys2.default)(component.propTypes);
  var propsWithProvidedValues = (0, _keys2.default)(possibleValuesByPropName);
  var missingProps = componentProps.filter(function (pn) {
    return propsWithProvidedValues.indexOf(pn) < 0;
  });

  if (missingProps.length) {
    return new Error("Missing possible values for props: " + missingProps.join(", "));
  }

  return null;
};

var defaultOptions = {
  CombinationRenderer: _CombinationRenderer2.default,
  showSource: true,
  mustProvideAllProps: false,
  style: {},
  combinationsModifier: function combinationsModifier(x) {
    return x;
  }
};

function withPropsCombinations(component, possibleValuesByPropName, userOptions) {
  var options = (0, _extends3.default)({}, defaultOptions, userOptions);

  if (!!options.renderCombination) {
    throw new Error("renderCombination option is deprecated. \nPlease use CombinationRenderer instead. \nSee https://github.com/evgenykochetkov/react-storybook-addon-props-combinations#combinationrenderer");
  }

  var CombinationRenderer = options.CombinationRenderer,
      combinationsModifier = options.combinationsModifier,
      mustProvideAllProps = options.mustProvideAllProps;


  return function () {
    if (mustProvideAllProps) {
      var err = checkForMissingProps(component, possibleValuesByPropName);

      if (err) {
        return _react2.default.createElement(_ErrorDisplay2.default, { message: err.message });
      }
    }

    var propsCombinations = combinationsModifier((0, _utils.combinations)(possibleValuesByPropName));

    return _react2.default.createElement(
      "div",
      null,
      propsCombinations.map(function (props, idx) {
        return _react2.default.createElement(CombinationRenderer, {
          Component: component,
          props: props,
          options: options,
          key: idx
        });
      })
    );
  };
}

function createCombinationProps(options) {
  if (!options.hasOwnProperty("hoverState")) {
    options.hoverState = [true, false];
  }
  if (!options.hasOwnProperty("focusState")) {
    options.focusState = [true, false];
  }
  return (0, _extends3.default)({}, options);
}
function getFieldTextForSymbol(obj, key) {
  if (typeof obj === "boolean") {
    return obj ? key + "/" : "";
  } else if (typeof obj[key] === "string") {
    return obj + "/";
  }
  return obj.toString() + "/";
}
function stateLabel(hoverState, focusState) {
  return "" + (hoverState ? "Hover/" : "") + (focusState ? "Focus/" : "");
}

function createSymbol(combinations, Component) {
  var getLabels = function getLabels(props, labels) {
    var symbolLabels = (0, _keys2.default)(props).filter(function (val) {
      return val !== "focusState" && val !== "hoverState";
    }).map(function (key) {
      if (labels.hasOwnProperty(key)) {
        return labels[key](props[key]);
      }
      return getFieldTextForSymbol(props[key], key);
    });
    return symbolLabels;
  };
  var wrappedComponent = function wrappedComponent(props) {
    var keys = getLabels(props, combinations.labels);
    var hoverState = props.hoverState,
        focusState = props.focusState;

    return _react2.default.createElement(
      "div",
      {
        style: { padding: "7px" },
        "data-sketch-symbol": combinations.componentName + "/" + keys.join("") + stateLabel(hoverState, focusState),
        "data-sketch-hover": hoverState,
        "data-sketch-focus": focusState
      },
      _react2.default.createElement(Component, props)
    );
  };
  var ReturnVal = withPropsCombinations(wrappedComponent, combinations.props, {
    showSource: false
  });

  return _react2.default.createElement(ReturnVal, null);
}

function setDefaults(newDefaults) {
  return (0, _assign2.default)(defaultOptions, newDefaults);
}