import { useState } from "react";

export default function CsvUploader() {
  const [file, setFile] = useState(null);
  const [graphType, setGraphType] = useState("directed");
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("graph_type", graphType);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("File uploaded successfully!");
      } else {
        setMessage("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg max-w-md mx-auto bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload CSV File</h2>
      
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Graph Type:</label>
        <div className="flex gap-4 mt-1">
          <label className="inline-flex items-center">
            <input 
              type="radio" 
              name="graphType" 
              value="directed" 
              checked={graphType === "directed"} 
              onChange={() => setGraphType("directed")} 
              className="form-radio text-blue-500"
            />
            <span className="ml-2">Directed</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="radio" 
              name="graphType" 
              value="undirected" 
              checked={graphType === "undirected"} 
              onChange={() => setGraphType("undirected")} 
              className="form-radio text-blue-500"
            />
            <span className="ml-2">Undirected</span>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700 mb-2">Select CSV File:</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="block w-full border border-gray-300 rounded-lg p-2 cursor-pointer text-gray-700 file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-lg file:cursor-pointer hover:file:bg-blue-600"
        />
      </div>

      <button 
        onClick={handleUpload} 
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Upload
      </button>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
