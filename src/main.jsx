import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import { store } from "./stores/index.js";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer position="top-right" autoClose={2000} />
      <Toaster position="top-right" richColors expand duration={2000}  />
    </QueryClientProvider>
  </Provider>
);
