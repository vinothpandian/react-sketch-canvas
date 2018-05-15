import React from "react";
import Immutable from "immutable";
import PropTypes from "prop-types";
import { Map } from "immutable";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
  fill: "none"
};

const Path = ({ paths }) => {
  const pathData = `M ${paths
    .map(p => `${p.get("x")} ${p.get("y")}`)
    .join(" L ")}`;

  return <path stroke="black" d={pathData} />;
};

const SvgElement = ({ paths, width, height, strokeColor, strokeWidth }) => (
  <svg
    version="1.1"
    baseProfile="full"
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{
      strokeColor,
      strokeWidth,
      ...styles
    }}
  >
    {paths.map((path, index) => <Path key={index} paths={path} />)}
  </svg>
);

export default SvgElement;
