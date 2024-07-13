import { generateNodes } from "./generateNodes";

const init = () => {
  const { board } = window.miro;

  board.ui.on("icon:click", async () => {
    generateNodes();
  });
};

init();
