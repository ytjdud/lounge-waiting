import { ContactNumbers, StoreInfos } from './enum.js';

const accessToken = "";

function generateStoreHTML(contentContainer, storeInfos) {
  for (const [key, store] of Object.entries(storeInfos)) {
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

      floorContainer.appendChild(floorLabel);
      floorContainer.appendChild(floorStatus);
      floorContainer.appendChild(contactContainer);

      storeContainer.appendChild(floorContainer);
    });

    contentContainer.appendChild(storeContainer);
  }
}

async function fetchWaitingCount() {
  try {
    // 모든 API 요청을 병렬로 실행
    const promises = Object.values(StoreInfos)
      .flatMap((store) => store.floors)
      .map((floor) =>
        fetch(floor.api, {
          method: "GET",
          headers: {
            "Access-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
          },
        })
          .then((response) => {
            if (!response.ok) {
              console.error(`Failed to fetch ${floor.api}:`, response.status);
              return { id: floor.id, error: true };
            }
            return response.json().then((data) => ({
              id: floor.id,
              waitingCount: data.waiting_info?.queued_waitings_count,
            }));
          })
          .catch((error) => {
            console.error(`Error fetching ${floor.api}:`, error);
            return { id: floor.id, error: true };
          })
      );

    // 모든 요청이 완료되면 처리
    const results = await Promise.all(promises);

    // 데이터를 화면에 업데이트
    results.forEach((result) => {
      const element = document.getElementById(result.id);
      if (results.error){
        element.textContent = "Error";
      } else {
        const waitingCount = result.waitingCount;
        // TODO: 시간 지나면 '영업 종료' 표시
        const displayText = waitingCount === 0
        ? "<strong>바로입장</strong>"
        : ( waitingCount
          ? `대기 <strong>${waitingCount}팀</strong>`
          : "N/A" );

        element.innerHTML = displayText;
      }
    });
  } catch (error) {
    console.error("Error fetching waiting counts:", error);
  }
}

/**
 * Floor Status를 누르면 실제 나우웨이팅 페이지로 이동한다.
 * 
 * @param {*} storeInfos 
 */
async function addClickEventToFloorStatus(storeInfos) {
  for (const [key, store] of Object.entries(storeInfos)) {
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

const contentContainer = document.querySelector(".content");
generateStoreHTML(contentContainer, StoreInfos);

document.addEventListener("DOMContentLoaded", () => {
  // const buttonCallContainer = document.getElementById("button-call-container");

  // Object.entries(ContactNumbers).forEach(([location, number]) => {
  //   const button = document.createElement("a");
  //   button.href = `tel:${number}`;
  //   button.className = `button`;
  //   button.textContent = location;
  //   buttonCallContainer.appendChild(button);
  // });
  fetchWaitingCount();
  addClickEventToFloorStatus(StoreInfos);
  
  // TODO: 라운지마다 전화번호 적용하기
  // const contact = document.addEventListener("click", () => {
  //   window.location.href = "tel:02";
  // });
});