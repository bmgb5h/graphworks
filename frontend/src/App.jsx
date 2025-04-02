import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import GraphBuilder from "./components/GraphBuilder";
import GraphViewer from "./components/GraphViewer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GraphBuilder />} />
        <Route path="/graph/:graphId" element={<GraphViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
