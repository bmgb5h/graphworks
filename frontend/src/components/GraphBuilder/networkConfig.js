// Network visualization configuration options
export const networkOptions = {
  layout: {
    improvedLayout: true,
    randomSeed: 1,
    hierarchical: false,
  },
  physics: {
    enabled: true,
    solver: "forceAtlas2Based",
    forceAtlas2Based: {
      gravitationalConstant: -120,
      centralGravity: 0.005,
      springLength: 400,
      springConstant: 0.02,
      avoidOverlap: 1,
    },
    maxVelocity: 50,
    stabilization: {
      iterations: 200,
      fit: true,
    },
  },
  nodes: {
    shape: "circle",
    size: 30,
    font: { size: 14, color: "#000000", align: "middle" },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
    shadow: true,
    font: { size: 20, align: "middle" },
    arrows: {
      to: { enabled: true, scaleFactor: 1.5, type: "arrow" },
    },
    color: "#333",
    smooth: { type: "curvedCW", roundness: 0.2 },
  },
  manipulation: { 
    enabled: false
  },
  interaction: {
    hover: true,
    multiselect: false,
    dragNodes: true
  },
};