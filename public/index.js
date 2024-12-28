import { StoreInfos } from './enum.js';

const accessToken = "";

const reloadId = "reload";
const rotateAnimationClassName = "rotating";
const intervalTime = 1000 * 60 * 5; // 5분


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
      contactContainer.id = `contact-${floor.id}`;

      floorContainer.appendChild(floorLabel);
      floorContainer.appendChild(floorStatus);
      floorContainer.appendChild(contactContainer);

      storeContainer.appendChild(floorContainer);
    });

    contentContainer.appendChild(storeContainer);
  }
}

async function fetchAllWaitingCounts() {
  try {
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

    const results = await Promise.all(promises);

    results.forEach((result) => {
      const element = document.getElementById(result.id);
      if (results.error){
        element.textContent = "Error";
      } else {
        const waitingCount = result.waitingCount;
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

/**
 * 전화기 버튼을 누르면 해당 라운지에 전화를 할 수 있다.
 * 
 * @param {*} storeInfos 
 */
async function addClickEventToContact(storeInfos) {
  for (const [key, store] of Object.entries(storeInfos)) {
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

/**
 * 새로고침 버튼을 누르면 대기 인원이 새로고침된다.
 * 
 * @param {*} reloadId 
 * @param {*} rotateAnimationClassName 
 */
async function addClickEventToReload(reloadId, rotateAnimationClassName){
  const reloadElement = document.getElementById(reloadId);

  reloadElement.addEventListener('click', () => {
    reloadElement.classList.add(rotateAnimationClassName);

    setTimeout(() => {
      reloadElement.classList.remove(rotateAnimationClassName);
    }, 1000*0.5); // 0.5초

    fetchAllWaitingCounts();
  });
}

/**
 * 현재 시간이 백화점 영업 시간 내인지 확인하는 함수
 * 
 * @returns boolean
 */
function isWithinAllowedTime() {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const currentHour = koreaTime.getHours();
  const currentMinute = koreaTime.getMinutes();
  const currentDay = koreaTime.getDay // 0(일요일) ~ 6(토요일)

  // 월 ~ 목 영업시간 : 10:30 ~ 8:00
  if (currentDay >= 1 && currentDay <= 4) {
    if (
      (currentHour > 10 || (currentHour === 10 && currentMinute >= 30)) 
        && currentHour < 20
    ) {
      return true;
    }
    return false;
  } 
  
  // 금 ~ 일 영업시간 : 10:30 ~ 8:30
  else {
    if (
      (currentHour > 10 || (currentHour === 10 && currentMinute >= 30)) 
        && (currentHour < 20 || (currentHour === 20 && currentMinute < 30))

    ) {
      return true;
    }
    return false;
  }
}

/**
 * 현재 시간을 확인해 주기적으로 대기 팀 수를 새로고침하거나 영업 종료를 표시하는 함수
 * 
 * @param {*} intervalTime 
 * @param {*} apiCallFunction 
 */
function startIntervalWithTimeRestriction(intervalTime) {
  if (isWithinAllowedTime()) {
    fetchAllWaitingCounts();
  } else {
    setClosedText(StoreInfos);
  }

  // setInterval을 설정하되, 조건 확인 후 API 호출
  setInterval(() => {
    if (isWithinAllowedTime()) {
      fetchAllWaitingCounts();
    }
  }, intervalTime);
}

/**
 * 화면에 '영업 종료'를 표시하는 함수
 * 
 * @param {*} storeInfos 
 */
async function setClosedText(storeInfos) {
  for (const [key, store] of Object.entries(storeInfos)) {
    store.floors.forEach((floor) => {
      const element = document.getElementById(floor.id);
      element.innerHTML = "<strong>영업 종료</strong>";
    });
  }
}

/**
 * 페이지 로드 시 특정 시간에 새로고침을 설정하는 함수
 * 
 * @param {*} hour 
 * @param {*} minute 
 * @param {*} second 
 */
function refreshAt(hour, minute, second) {
  const now = new Date();
  const target = new Date();

  target.setHours(hour);
  target.setMinutes(minute);
  target.setSeconds(second);
  target.setMilliseconds(0);

  // 현재 시간이 이미 대상 시간을 지난 경우, 다음 날로 설정
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const timeout = target.getTime() - now.getTime();

  setTimeout(() => {
    location.reload();
  }, timeout);
}

const listContainer = document.querySelector(".list-container");
generateStoreHTML(listContainer, StoreInfos);

document.addEventListener("DOMContentLoaded", () => {
  addClickEventToFloorStatus(StoreInfos);
  addClickEventToContact(StoreInfos);
  addClickEventToReload(reloadId, rotateAnimationClassName)

  refreshAt(10, 30, 1);

  startIntervalWithTimeRestriction(intervalTime);
});