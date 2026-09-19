import nextVitals from "eslint-config-next/core-web-vitals";
import reactConfig from "./react.js";

export default [...reactConfig, ...nextVitals];
