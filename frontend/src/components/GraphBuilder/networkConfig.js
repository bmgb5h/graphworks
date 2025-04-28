// Network visualization configuration options
export const networkOptions = {
    nodes: {
      shape: "circle",
      size: 30,
      font: { size: 14, color: "#000000" },
      borderWidth: 2,
      shadow: true,
      scaling: {
        min: 10,
        max: 30,
        label: {
          min: 14,
          max: 30,
          drawThreshold: 5
        }
      },
    },
    edges: {
      width: 2,
      shadow: true,
      font: { size: 14, align: "middle" },
      arrows: {
        to: { enabled: true, scaleFactor: 1.5, type: 'arrow' }
      },
      color: "#333",
      smooth: { type: "curvedCW", roundness: 0.2 }
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -3000,
        centralGravity: 0.3,
        springLength: 150,
        springConstant: 0.04,
        damping: 0.09
      }
    },
    manipulation: {
      enabled: false,
    },
    interaction: {
      hover: true,
      multiselect: false,
      dragNodes: true
    }
  };