import { BrowserRouter } from "react-router-dom";
import "./App.css";
import RouterMain from "./router/RouterMain";

function App() {
  return (
    <BrowserRouter>
      <RouterMain />
    </BrowserRouter>
  );
}

export default App;
