const SelectedItemInfo = ({ selectedItem, selectedItemType }) => {
  if (!selectedItem) {
    return (
      <div className="text-sm">
        <strong>Selected: </strong>Nothing selected
      </div>
    );
  }

  const selectionText = selectedItemType === "node" 
    ? `Node: ${selectedItem}`
    : `Edge: (${selectedItem.from}, ${selectedItem.to})`;

  return (
    <div className="text-sm">
      <strong>Selected: </strong>{selectionText}
    </div>
  );
};

export default SelectedItemInfo;