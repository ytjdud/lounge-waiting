import { OPTIONS } from './enum.js';

export function generateControllerHTML() {
  const listController = document.querySelector(".list-contollers");

  const selectElement = document.createElement("select");
  selectElement.className = "select";
  selectElement.id = "select";

  Object.entries(OPTIONS).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = key;
    option.text = value.text;
    if (value.selected) option.selected = true;
    selectElement.appendChild(option);
  });

  const reloadDiv = document.createElement("div");
  reloadDiv.className = "reload";
  reloadDiv.id = "reload";

  listController.appendChild(selectElement);
  listController.appendChild(reloadDiv);
}

export function generateStoreHTML(stores) {
  const listContainer = document.querySelector(".list-container");

  for (const store of stores) {
    const storeContainer = document.createElement("div");
    storeContainer.className = "store-container";

    const storeLabel = document.createElement("div");
    storeLabel.className = "store-container label";
    storeLabel.textContent = store.name;
    storeContainer.appendChild(storeLabel);

    store.floors.forEach((floor) => {
      const floorContainer = document.createElement("div");
      floorContainer.className = "floor-container";

      const floorLabel = document.createElement("span");
      floorLabel.className = "floor-label";
      floorLabel.textContent = floor.label;

      const floorStatus = document.createElement("span");
      floorStatus.className = "floor-status";
      floorStatus.id = floor.id;
      floorStatus.textContent = "-";

      const contactContainer = document.createElement("div");
      contactContainer.className = "contact";
      contactContainer.id = `contact-${floor.id}`;

      floorContainer.appendChild(floorLabel);
      floorContainer.appendChild(floorStatus);
      floorContainer.appendChild(contactContainer);

      storeContainer.appendChild(floorContainer);
    });

    listContainer.appendChild(storeContainer);
  }
}