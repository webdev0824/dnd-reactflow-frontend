import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from "reactflow";
import "bootstrap/dist/css/bootstrap.min.css";
import image1 from "../img1.png";
import Node from "./CustomeNode/MessageNode";
import axios from "axios";

// Utils
import { isAllNodeisConnected } from "../utils";

// Styles
import "reactflow/dist/style.css";
import "./dnd.css";
import "./updatenode.css";

const getId = () => "dndnode_" + Math.floor(Math.random() * 1000000000) + 1;

const nodeTypes = { node: Node };

const OverviewFlow = () => {


  const reactFlowWrapper = useRef(null);
  const textRef = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [strTitle, setStrTitle] = useState("");
  const [strContent, setStrContent] = useState("");
  const onInit = (reactFlowInstance) => {
    setReactFlowInstance(reactFlowInstance);
    getInfo();
  }

  const getInfo = () => {
    axios.get(`http://localhost:2000/api/document`, {
      headers: {
        'token': "123456"
      }
    }).then((res) => {
      setNodes(res.data.data.nodes);
      setEdges(res.data.data.edges);
    }).catch((err) => {
      setNodes([]);
      setEdges([]);
    });

    axios.get(`http://localhost:2000/api/extra`, {
      headers: {
        'token': "123456"
      }
    }).then((res) => {
      setStrContent(res.data.data.content);
    }).catch((err) => {
      setStrContent("");
    });
  }

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

    const type = event.dataTransfer.getData("application/reactflow");
    const label = event.dataTransfer.getData("content");
    console.log(reactFlowInstance, "reactIns");
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    });
    const newNode = {
      id: getId(),
      type,
      position,
      data: { heading: "Send Message", content: label }
    };
    setNodes((es) => es.concat(newNode));
    setSelectedNode(newNode.id);
  };
  const onConnect = useCallback(
      (params) =>
          setEdges((eds) =>
              addEdge({ ...params, markerEnd: { type: "arrowclosed", animated: true } }, eds)
          ),
      [setEdges]
  );

  const [nodeName, setNodeName] = useState("Node 1");

  useEffect(() => {
    const node = nodes.filter((node) => {
      if (node.selected) return true;
      return false;
    });
    if (node[0]) {
      setSelectedNode(node[0]);
      setIsSelected(true);
    } else {
      setSelectedNode("");
      setIsSelected(false);
    }
  }, [nodes]);
  useEffect(() => {
    setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode?.id) {
            node.data = {
              ...node.data,
              content: strTitle || " "
            };
          }
          return node;
        })
    );
  }, [strTitle, setNodes]);

  const onAdd = useCallback(
      (data) => {
        const type = "node";
        const newNode = {
          id: getId(),
          type,
          position: {
            x: 50,
            y: Math.round(Math.random() * 500) + 50,
          },
          data: { content: data }
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNode(newNode.id);
      },
      [setNodes, nodes]
  );
  const onDeleteNode = () => {
    // let _nodes = nodes;
    // const index = _nodes.findIndex(node => node.id === selectedNode.id); //use id instead of index
    // if (index > -1) { //make sure you found it
    //   _nodes.splice(index, 1);
    //   setNodes(_nodes);
    // }

    setNodes(nds => {
      return nds.filter(node => node.id !== selectedNode.id)
    });

  }
  const onNodeItemClick = () => {
    // setSelectedNode(node[0]);
    setIsSelected(true);
    setStrTitle(selectedNode.data.content);
  }
  const handleContentChange = (event) => {
    setStrContent(event.target.value);
  };

  const handleTitleChange = (event) => {
    setStrTitle(event.target.value);
  };

  const handleContentSubmit = () => {
    const new_data = {
      "content": strContent
    }
    axios.post('http://localhost:2000/api/extra', new_data, {
      headers: {
        'content-type': 'application/json',
        'token': "1234567"
      }
    }).then((res) => {
      alert("Extra info is saved successfully.");
    }).catch((err) => {
      alert("Failure: ");
    });
    localStorage.setItem("content", strContent);
  };

  const handleTitleSubmit = () => {
    const new_data = {
      "nodes": nodes,
      "edges": edges
    }
    axios.post('http://localhost:2000/api/document', new_data, {
      headers: {
        'content-type': 'application/json',
        'token': "1234567"
      }
    }).then((res) => {
      alert("Flow Chart is saved successfully.");
    }).catch((err) => {
      alert("Failure: ");
    });
    localStorage.setItem("nodes", JSON.stringify(nodes));
    localStorage.setItem("edges", JSON.stringify(edges));
  };

  return (
      <div className="row frm-bg-gray">

        <div className="col-md-6">
          <div style={{backgroundColor:"black", margin:"20px"}}>
            <div style={{ height: "100vh"}}>
              <h3 className="text-center text-white">TITLE 1</h3>
              <div className="row">
                <div className="col-md-3">
                  <button className="btn btn-secondary" style={{marginLeft:"10px"}} onClick={() => onAdd("New Node")}>
                    Add New Node
                  </button>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-secondary" style={{marginLeft:"10px"}} onClick={onDeleteNode}>
                    Delete Node
                  </button>
                </div>

              </div>

              <div className="row" style={{ height: "91vh"}}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={onInit}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeItemClick}
                    attributionPosition="bottom-left"
                ></ReactFlow>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div style={{backgroundColor:"black", margin:"20px"}}>
            <div style={{ height: "100vh"}}>
              <div className="row">
                <h3 className="text-center text-white">TITLE 2</h3>
              </div>
              <div className="row d-flex justify-content-center">
                <div className="col-md-6 p-3" style={{textAlign: "center"}}>
                  <img className="frm-border-2rem" src={image1} alt="Placeholder" />
                  {/* <img src="img1.png" height="100%" width="100%" style="border-radius: 2rem; width:20vw; height:20vw;"> */}
                </div>
                <div className="col-lg-6 p-3" style={{textAlign: "center"}}>
                  <form className="bg-white frm-border-2rem">
                    <div className="row h-75">

                    </div>
                    <div className="row px-4">
                      <input type={"text"} className="form-control text-white" placeholder="Search" style={{backgroundColor: "gray", borderRadius: "1rem", color:"white"}}/>
                      {/* <input class="form-control text-white" type="text" style="background-color: gray; border-radius: 1rem; border-color: transparent; color:white;" placeholder="Search"> */}
                    </div>
                  </form>
                </div>
              </div>
              <div className="row d-flex justify-content-center">
                <div className="col-md-6 p-3">
                  <div className="p-3 bg-white frm-border-2rem">
                    <textarea className="form-control h-75" value={strContent} onChange={handleContentChange}/>
                    <div className="row pt-3 px-4">
                      <button className="btn btn-secondary align-bottom" onClick={handleContentSubmit}>Submit</button>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 p-3">
                  <form className="p-3 bg-white frm-border-2rem">
                    <textarea className="form-control h-100" value={strTitle} onChange={handleTitleChange}/>
                  </form>
                </div>
              </div>

              <div className="row" style={{marginRight: "9rem", marginLeft: "9rem", marginTop:"1rem"}}>
                <button className="btn btn-secondary" onClick={handleTitleSubmit}>Save Flow Chart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OverviewFlow;
