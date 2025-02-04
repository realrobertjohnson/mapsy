import { COLOR_MAP } from "./constants";
const { board } = window.miro;
const enableConsoleLogging = true;
export const generateNodes = async () => {
  if (enableConsoleLogging) console.clear();
  const nodesContent = [];

  try {

    // Get selected widgets
    let selectedWidgets = await board.experimental.getSelection();

    if (selectedWidgets.length === 0) {
      await miro.board.notifications.showError("No objects selected. Select something and try again.");
      return;
    }

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


    // This was causing "syncing" messages wtih 20 stickty notes...
    // async function createNodesParallel(nodesContent) {
    //   const promises = nodesContent.map((itemContent) =>
    //     board.experimental.createMindmapNode({
    //       nodeView: { content: `${itemContent.content}` },
    //       x: itemContent.x + 800,
    //       y: itemContent.y,
    //     })
    //   );

    //   const results = await Promise.allSettled(promises); // Runs all at once
    //   if (enableConsoleLogging) console.log("All nodes created:", results);
    // }

    // // Call the function
    // await createNodesParallel(nodesContent);

    async function createNodesWithConcurrency(nodesContent, concurrency = 5) {
      const results = [];
      const chunks = Array.from({ length: Math.ceil(nodesContent.length / concurrency) }, (_, i) =>
        nodesContent.slice(i * concurrency, i * concurrency + concurrency)
      );

      for (const chunk of chunks) {
        const chunkPromises = chunk.map((itemContent) =>
          board.experimental.createMindmapNode({
            nodeView: { content: `${itemContent.content}` },
            x: itemContent.x + 800,
            y: itemContent.y,
          })
        );

        results.push(...(await Promise.allSettled(chunkPromises)));
        if (enableConsoleLogging) console.log("Processed batch:", results);
      }

      return results;
    }

    // Call with a concurrency limit of 5
    await createNodesWithConcurrency(nodesContent, 5);


    await miro.board.notifications.showInfo(
      `${nodesContent.length} mind map node${nodesContent.length === 1 ? " was" : "s were"} successfully created!`
    );

  } catch (error) {
    console.error("Error executing Mapsy:", error);
    await miro.board.notifications.showError("An error occurred while creating mind map nodes.");
  }
};