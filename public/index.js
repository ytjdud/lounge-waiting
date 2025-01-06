import { STORE_INFO } from './enum.js';

const stores = Object.values(STORE_INFO);


function generateStoreHTML(stores) {
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

/**
 * Floor Status를 누르면 실제 나우웨이팅 페이지로 이동한다.
 * 
 */
async function addClickEventToFloorStatus(stores) {
  for (const store of stores) {
    store.floors.forEach((floor) => {
      const floorStatusElement = document.getElementById(floor.id);
      if (floorStatusElement) {
        floorStatusElement.onclick = () => {
          window.open(floor.url, "_blank"); // 새 탭에서 URL 열기
        };
      }
    });
  }
}

/**
 * 전화기 버튼을 누르면 해당 라운지에 전화를 할 수 있다.
 * 
 */
async function addClickEventToContact(stores) {
  for (const store of stores) {
    store.floors.forEach((floor) => {
      const contactElement = document.getElementById(`contact-${floor.id}`);
      if(contactElement) {
        contactElement.onclick = () => {
          window.location.href = `tel:${floor.contact}`;
        };
      }
    });
  }
}


generateStoreHTML(stores);

document.addEventListener("DOMContentLoaded", () => {
  addClickEventToFloorStatus(stores);
  addClickEventToContact(stores);
});