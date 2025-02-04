import { COLOR_MAP } from "./constants";
const { board } = window.miro;
const enableConsoleLogging = true;
export const generateNodes = async () => {
  if (enableConsoleLogging) console.clear();

  const nodesContent = [];

  try {

    // Get selected widgets
    let selectedWidgets = await board.experimental.getSelection();

    // Filtering out shapes from all the selected widgets.
    selectedWidgets = selectedWidgets.filter((item) => {
      return ["shape", "text", "sticky_note", "mindmap_node", "card"].includes(item.type); // added "card"
    });

    // For each selected item, get title
    selectedWidgets.forEach(async (contentItem) => {
      let itemContent = "";
      if (contentItem.type === "card") { itemContent = contentItem.title } else { itemContent = contentItem.content }
      if (enableConsoleLogging) console.log(itemContent);
      nodesContent.push({
        content: itemContent,
        x: contentItem.x,
        y: contentItem.y
      });
    });
    if (enableConsoleLogging) console.log(nodesContent); // Check the final array after the loop

    async function createNodesParallel(nodesContent) {
      const promises = nodesContent.map((itemContent) =>
        board.experimental.createMindmapNode({
          nodeView: { content: `${itemContent.content}` },
          x: itemContent.x + 800,
          y: itemContent.y,
        })
      );

      const results = await Promise.allSettled(promises); // Runs all at once
      if (enableConsoleLogging) console.log("All nodes created:", results);
    }

    // Call the function
    await createNodesParallel(nodesContent);

    await miro.board.notifications.showInfo(
      `${nodesContent.length} mind map node${nodesContent.length === 1 ? " was" : "s were"} successfully created!`
    );

  } catch (error) {
    console.error("Error executing Mapsy:", error);
    await miro.board.notifications.showError("An error occurred while creating mind map nodes.");
  }
};