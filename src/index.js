import React from "react";

import objectHash from "object-hash";

import { combinations } from "./utils";
import DefaultCombinationRenderer from "./CombinationRenderer";
import ErrorDisplay from "./ErrorDisplay";

export { withOneOfBool } from "./modifiers";

const checkForMissingProps = (component, possibleValuesByPropName) => {
  if (typeof component === "string") {
    return new Error(
      "mustProvideAllProps option is not supported for built-in components"
    );
  }

  const componentProps = Object.keys(component.propTypes);
  const propsWithProvidedValues = Object.keys(possibleValuesByPropName);
  const missingProps = componentProps.filter(
    pn => propsWithProvidedValues.indexOf(pn) < 0
  );

  if (missingProps.length) {
    return new Error(
      "Missing possible values for props: " + missingProps.join(", ")
    );
  }

  return null;
};

const defaultOptions = {
  CombinationRenderer: DefaultCombinationRenderer,
  showSource: true,
  mustProvideAllProps: false,
  style: {},
  combinationsModifier: x => x
};

export default function withPropsCombinations(
  component,
  possibleValuesByPropName,
  userOptions
) {
  const options = {
    ...defaultOptions,
    ...userOptions
  };

  if (!!options.renderCombination) {
    throw new Error(
      "renderCombination option is deprecated. \nPlease use CombinationRenderer instead. \nSee https://github.com/evgenykochetkov/react-storybook-addon-props-combinations#combinationrenderer"
    );
  }

  const {
    CombinationRenderer,
    combinationsModifier,
    mustProvideAllProps
  } = options;

  return () => {
    if (mustProvideAllProps) {
      const err = checkForMissingProps(component, possibleValuesByPropName);

      if (err) {
        return <ErrorDisplay message={err.message} />;
      }
    }

    const propsCombinations = combinationsModifier(
      combinations(possibleValuesByPropName)
    );

    return (
      <div>
        {propsCombinations.map((props, idx) => (
          <CombinationRenderer
            Component={component}
            props={props}
            options={options}
            key={idx}
          />
        ))}
      </div>
    );
  };
}

export function createCombinationProps(options) {
  if (!options.hasOwnProperty("hoverState")) {
    options.hoverState = [true, false];
  }
  if (!options.hasOwnProperty("focusState")) {
    options.focusState = [true, false];
  }
  return {
    ...options
  };
}
export function getFieldTextForSymbol(obj, key) {
  if (typeof obj === "boolean") {
    return obj ? `${key}/` : "";
  } else if (typeof obj[key] === "string") {
    return obj + "/";
  }
  return obj.toString() + "/";
}
export function stateLabel(hoverState, focusState) {
  return `${hoverState ? "Hover/" : ""}${focusState ? "Focus/" : ""}`;
}

export function createSymbol(combinations, Component) {
  const getLabels = (props, labels) => {
    const symbolLabels = Object.keys(props)
      .filter(val => val !== "focusState" && val !== "hoverState")
      .map(key => {
        if (labels.hasOwnProperty(key)) {
          return labels[key](props[key]);
        }
        return getFieldTextForSymbol(props[key], key);
      });
    return symbolLabels;
  };
  const wrappedComponent = props => {
    const keys = getLabels(props, combinations.labels);
    const { hoverState, focusState } = props;
    return (
      <div
        style={{ padding: "7px" }}
        data-sketch-symbol={
          `${combinations.componentName}/` +
          keys.join("") +
          currentState(hoverState, focusState)
        }
        data-sketch-hover={hoverState}
        data-sketch-focus={focusState}
      >
        <Component {...props} />
      </div>
    );
  };
  const ReturnVal = withPropsCombinations(
    wrappedComponent,
    combinations.props,
    {
      showSource: false
    }
  );

  return <ReturnVal />;
}

export function setDefaults(newDefaults) {
  return Object.assign(defaultOptions, newDefaults);
}
