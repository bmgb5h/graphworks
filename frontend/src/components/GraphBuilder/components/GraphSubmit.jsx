const GraphSubmit = ({ graphTitle, setGraphTitle, processGraph }) => {
  return (
    <div className="border p-4 rounded bg-white shadow-sm flex flex-col gap-2 mt-4">
      <span className="font-semibold text-xl">Give Your Graph a Name</span>
      <input
        type="text"
        placeholder="Graph Title"
        value={graphTitle}
        onChange={(e) => setGraphTitle(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={processGraph}
        className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
      >
        Save Graph
      </button>
    </div>
  );
};

export default GraphSubmit;
