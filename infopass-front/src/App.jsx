import { BrowserRouter } from "react-router-dom";
import "./App.css";
import RouterMain from "./router/RouterMain";
import GlobalBackground from "./pages/GlobalBackground";

function App() {
  return (
    <BrowserRouter>
        <RouterMain />
    </BrowserRouter>
  );
}

export default App;
