import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  // test frontend to backend connection
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => setMessage("Error: " + error.message));
  }, []);

  return <h1>{message}</h1>;
}

export default App;
