import { StoreInfos } from './enum.js';

const accessToken = "";
const reloadId = "reload";
const rotateAnimationClassName = "rotating";
const intervalTime = 1000 * 60 * 5; // 5분
const stores = Object.values(StoreInfos);


async function fetchAllWaitingCounts() {
  try {
    const promises = stores.flatMap((store) => store.floors)
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

    if (isWithinAllowedTime()){
      fetchAllWaitingCounts();
    } else {
      setClosedText(stores);
    }
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
  const currentDay = koreaTime.getDay() // 0(일요일) ~ 6(토요일)

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
    setClosedText(stores);
  }

  // setInterval을 설정하되, 조건 확인 후 API 호출
  const intervalId = setInterval(() => {
    if (isWithinAllowedTime()) {
      fetchAllWaitingCounts();
    } else {
      clearInterval(intervalId);
    }
  }, intervalTime);
}

/**
 * 화면에 '영업 종료'를 표시하는 함수
 * 
 * @param {*} stores 
 */
async function setClosedText(stores) {
  for (const store of stores) {
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
    fetchAllWaitingCounts();
  }, timeout);
}


addClickEventToReload(reloadId, rotateAnimationClassName)
refreshAt(10, 30, 1);
startIntervalWithTimeRestriction(intervalTime);