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

    // async function createNodesWithConcurrency(nodesContent, concurrency = 5) {
    //   const results = [];
    //   const chunks = Array.from({ length: Math.ceil(nodesContent.length / concurrency) }, (_, i) =>
    //     nodesContent.slice(i * concurrency, i * concurrency + concurrency)
    //   );

    //   for (const chunk of chunks) {
    //     const chunkPromises = chunk.map((itemContent) =>
    //       board.experimental.createMindmapNode({
    //         nodeView: { content: `${itemContent.content}` },
    //         x: itemContent.x + 800,
    //         y: itemContent.y,
    //       })
    //     );

    //     results.push(...(await Promise.allSettled(chunkPromises)));
    //     if (enableConsoleLogging) console.log("Processed batch:", results);
    //   }
    //   return results;
    // }

    // // Call with a concurrency limit of 5
    // await createNodesWithConcurrency(nodesContent, 5);

    async function createNodesWithConcurrency(nodesContent, concurrency = 5) {
      const newNodes = []; // Array to store created nodes
      const results = [];

      const chunks = Array.from({ length: Math.ceil(nodesContent.length / concurrency) }, (_, i) =>
        nodesContent.slice(i * concurrency, i * concurrency + concurrency)
      );

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (itemContent) => {
          const nodeResult = await board.experimental.createMindmapNode({
            nodeView: { content: `${itemContent.content}` },
            x: itemContent.x + 800,
            y: itemContent.y,
          });

          newNodes.push(nodeResult); // Store the created node
          return nodeResult;
        });

        const settledResults = await Promise.allSettled(chunkPromises);
        results.push(...settledResults);

        if (enableConsoleLogging) console.log("Processed batch:", settledResults);
      }

      return { results, newNodes }; // Return both results and created nodes
    }

    // Call with a concurrency limit of 5
    const { results, newNodes } = await createNodesWithConcurrency(nodesContent, 5);

    await miro.board.deselect();
    await miro.board.select({ id: newNodes.map(f => f.id) });

    await miro.board.notifications.showInfo(
      `${nodesContent.length} mind map node${nodesContent.length === 1 ? " was" : "s were"} successfully created!`
    );

  } catch (error) {
    console.error("Error executing Mapsy:", error);
    await miro.board.notifications.showError("An error occurred while creating mind map nodes.");
  }
};