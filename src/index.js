import "core-js/features/map";
import "core-js/features/set";
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";
import Cookies from "./panels/Cookies";
import fetch2 from "./components/Fetch";

fetch2("sign").then((data) => {
  if (data.result === "ok") {
    try {
      localStorage.setItem("test", "test");
      localStorage.clear();
      bridge.send("VKWebAppInit");
      ReactDOM.render(<App />, document.getElementById("root"));
      if (process.env.NODE_ENV === "development") {
        import("./eruda").then(({ default: eruda }) => {});
      }
    } catch {
      ReactDOM.render(<Cookies />, document.getElementById("root"));
    }
  } else {
    ReactDOM.render(
      "Неверная подпись параметров запуска.",
      document.getElementById("root")
    );
  }
});
