const FileImport = ({ handleFileUpload }) => {
  return (
    <div className="border p-4 rounded bg-white shadow-sm flex flex-wrap gap-2 items-center mt-4">
      <span className="font-semibold text-xl w-full mb-2">Import a Graph From a File</span>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="p-2 border rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition w-full"
      />
    </div>
  );
};

export default FileImport;
