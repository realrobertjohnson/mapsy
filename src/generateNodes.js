import { COLOR_MAP } from "./constants";
const { board } = window.miro;
const generateCardObjectFor = (object, x, y) => {
  let cardColor = "#2399f3";

  if (object?.style?.fillColor) {
    const objectFillColor = object.style.fillColor;
    if (objectFillColor !== "transparent") {
      if (COLOR_MAP[objectFillColor]) {
        cardColor = COLOR_MAP[objectFillColor];
      } else {
        cardColor = objectFillColor;
      }
    }
  }
  // Add support for mind maps with text
  let title = object?.content || object?.nodeView?.content;
  const cardObject = {
    title: title,
    x: x,
    y: y,
    style: {
      cardTheme: cardColor,
    },
    tagIds: object.tagIds || [],
  };
  return cardObject;
};

export const generateNodes = async () => {

  // get selected widgets
  let selectedWidgets = await board.experimental.getSelection();

  // filtering out shapes from all the selected widgets.
  selectedWidgets = selectedWidgets.filter((item) => {
    return ["shape", "text", "sticky_note", "mindmap_node", "card"].includes(item.type); // added "card"
  });

  const cardsObjects = selectedWidgets.map((item) =>
    generateCardObjectFor(item, item.x + 800, item.y)
  );

  // START MAX CODE

  // Single out the first selected item
  let selectedItem;
  if (selectedWidgets.length > 0) { selectedItem = selectedWidgets[0] }

  // Get the content from the first item selected in the array of selected items -- this is '.content' for all items except cards, whose primary info is stored in '.title'
  let itemContent = "";
  if (selectedItem.type === "card") { itemContent = selectedItem.title } else { itemContent = selectedItem.content }

  // Create mind map root node -- insert 'itemContent' into content and adjust the 
  const root = await board.experimental.createMindmapNode({
    nodeView: {
      content: `${itemContent}`,
    },
    x: selectedItem.x + 800,
    y: selectedItem.y,
  });
  //END MAX CODE


  //  const cardsGeneratedPromise = cardsObjects.map(async (card) => {
  //    const cardResult = board.createCard(card);
  //    return cardResult;
  //  });

  // commented out
  //  const cardsGenerated = await Promise.all(cardsGeneratedPromise);
  //  const cardCount = cardsGenerated.length;
  //  if (cardCount > 0) {
  //    await board.viewport.zoomTo(cardsGenerated);
  //    console.log('Cardsy generated ${cardCount} cards for you.');
  //  }
};