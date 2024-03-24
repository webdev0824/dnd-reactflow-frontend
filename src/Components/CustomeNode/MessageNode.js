import React, { memo } from "react";

import { Handle, Position } from "reactflow";
import { style } from "./MessageNodeStyles";

const Node = ({ data, selected }) => {
  let customTitle = { ...style.title };
  customTitle.backgroundColor = "#757678";

  return (
    <div className="text-updater-node">
      <div style={{ ...style.body, ...(selected ? style.selected : []) }}>
        <div style={customTitle}>{data.content}</div>
        {/*<div style={style.contentWrapper}>{data.content}</div>*/}
      </div>
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Top} id="a" />
    </div>
  );
};

export default memo(Node);
