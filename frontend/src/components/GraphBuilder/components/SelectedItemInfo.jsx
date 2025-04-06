const SelectedItemInfo = ({ selectedItem, selectedItemType }) => {
  return (
    <div className="text-sm border-t pt-2 mt-1">
      <strong>Selected: </strong>
      {selectedItem
        ? selectedItemType === "node"
          ? `Node: ${selectedItem}`
          : `Edge: (${selectedItem.from}, ${selectedItem.to})`
        : "Nothing selected"}
    </div>
  );
};

export default SelectedItemInfo;