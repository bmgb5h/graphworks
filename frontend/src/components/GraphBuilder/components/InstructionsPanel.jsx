const InstructionsPanel = () => {
  return (
    <div className="p-3 bg-gray-100 rounded border">
      <h2 className="text-lg font-semibold mb-2">Graph Builder Instructions</h2>
      <ul className="list-disc pl-5">
        <li>Add nodes using the input field below</li>
        <li>Click &quot;Connect Nodes&quot; to create an edge, then <strong>drag from one node to another</strong></li>
        <li>Enter a weight when prompted for each edge</li>
        <li>Select a node or edge and press Delete or click &quot;Delete Selected&quot; to remove it</li>
        <li>Import a graph from CSV file or build manually</li>
        <li>Click &quot;Process Graph&quot; when you&apos;re done</li>
      </ul>
    </div>
  );
};

export default InstructionsPanel;