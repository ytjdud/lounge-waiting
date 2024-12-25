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
        fetch(floor.url, {
          method: "GET",
          headers: {
            "Access-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
          },
        })
          .then((response) => {
            if (!response.ok) {
              console.error(`Failed to fetch ${floor.url}:`, response.status);
              return { id: floor.id, error: true };
            }
            return response.json().then((data) => ({
              id: floor.id,
              waitingCount: data.waiting_info?.queued_waitings_count,
            }));
          })
          .catch((error) => {
            console.error(`Error fetching ${floor.url}:`, error);
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

const contentContainer = document.querySelector(".content");
generateStoreHTML(contentContainer, StoreInfos);

document.addEventListener("DOMContentLoaded", () => {
  // const buttonQueueContainer = document.getElementById("button-queue-container");
  // const buttonCallContainer = document.getElementById("button-call-container");

  // Object.entries(ExternalLinks).forEach(([location, link]) => {
  //   const button = document.createElement("a");
  //   button.href = `${link}`;
  //   button.target= `_blank`;
  //   button.className = `button`;
  //   button.textContent = location;
  //   buttonQueueContainer.appendChild(button);
  // })

  // Object.entries(ContactNumbers).forEach(([location, number]) => {
  //   const button = document.createElement("a");
  //   button.href = `tel:${number}`;
  //   button.className = `button`;
  //   button.textContent = location;
  //   buttonCallContainer.appendChild(button);
  // });
  fetchWaitingCount();
  
  // TODO: 라운지마다 전화번호 적용하기
  const contact = document.addEventListener("click", () => {
    window.location.href = "tel:02";
  });
});