import App from "./App";
import "./sass/styles.sass";

const app = new App();
document.body.appendChild(app.getElement());

app.start();

