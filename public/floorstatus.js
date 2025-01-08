import {
  STORE_INFO, OPTIONS,
  HTML_ID, HTML_CLASS_NAME_ROTATE_ANIMATION
} from './enum.js';
import { FloorStatusApi } from './api/FloorStatusApi.js';
import { createResult } from './fetchResultTemplate.js';

const intervalTime = 1000 * 60 * 5; // 5분
const stores = Object.values(STORE_INFO);

const floorStatusApi = new FloorStatusApi();

/**
 * 선택한 옵션에 따라 API 반환 값이 달라진다.
 * 기본(id: default): 전체 대기 인원을 표시
 * 개인(id: <이름>): 웨이팅을 걸어둔 곳이 있는 경우, 대기 순번을 표시
 * 
 * @param {*} selectId 
 */
async function getFloorStatusBySelectOption(selectId) {
  let selectedValue = document.getElementById(selectId).value;

  document.getElementById(selectId).addEventListener("change", function () {
    selectedValue = this.value;
    checkValue(selectedValue);
  });

  checkValue(selectedValue);
}

/**
 * 옵션 값에 따라 API 호출에 전달하는 access token 값이 다르다.
 * 
 * @param {*} selectedValue 
 */
function checkValue(selectedValue) {
  const accessToken = OPTIONS[selectedValue]?.accesstoken;
  accessToken
    ? handleInterval(intervalTime, selectedValue, accessToken)
    : console.log(`${selectedValue}의 토큰에 문제 발생. accessToken: ${accessToken}`);
}

/**
 * API를 주기적으로 호출하도록 인터벌을 설정하는 함수
 * 
 * @param {*} intervalTime 
 * @param {*} value 
 * @param {*} accessToken 
 */
function handleInterval(intervalTime, value, accessToken) {
  fetchAllWaitingCounts(value, accessToken);

  const intervalId = setInterval(() => {
    if (!isEveryStoreOpen()) {
      clearInterval(intervalId); // 영업 종료 시 인터벌 중지
    }
    fetchAllWaitingCounts(value, accessToken);
  }, intervalTime);
}

/**
 * 영업 시간 내인 경우, API를 호출하고 true를 반환한다.
 * 영업 시간 외인 경우, API를 호출하지 않고 영업 종료 텍스트를 작성한 후 false를 반환한다.
 */
function handleStoreStatus() { // TODO: main.js 하게 된다면 main.js에 아래 내용 작성
  isEveryStoreOpen()
    ? getFloorStatusBySelectOption(HTML_ID.select)
    : setClosedText(stores);
}

/**
 * 모든 라운지의 웨이팅 정보를 불러오고 화면에 표시한다. 
 * 
 * @param {} value 
 * @param {*} accessToken 
 */
async function fetchAllWaitingCounts(value, accessToken) {
  try {
    const promises = stores.flatMap((store) => store.floors)
      .map(async (floor) => {
        if (value === 'default') {
          return fetchDefaultWaiting(floor, accessToken);
        }
        const myWaiting = await fetchMyWaiting(floor, accessToken);
        return myWaiting.hasMyWaiting ? myWaiting : fetchDefaultWaiting(floor, accessToken);
      });

    const results = await Promise.all(promises);
    results.forEach(updateWaitingDisplay);
  } catch (error) {
    console.error("Error fetching waiting counts:", error);
  }
}

/**
 * 전체 웨이팅 팀 수를 불러온다. (내 웨이팅 정보X)
 * 
 * @param {*} floor 
 * @param {*} accessToken 
 * @returns 
 */
async function fetchDefaultWaiting(floor, accessToken) {
  const result = createResult(floor.id);

  try {
    const defaultWaitingResponse = await floorStatusApi.defaultWaitingRequest(floor, accessToken);
    if (!defaultWaitingResponse.ok) {
      console.error(`Failed to fetch ${floor.api}: ${defaultWaitingResponse.status}`);
      return { ...result, error: true };
    }

    const data = await defaultWaitingResponse.json();
    return { ...result, waitingCount: data.waiting_info?.queued_waitings_count };
  } catch (error) {
    console.error(`Error fetching default waiting for floor ${floor.id}:`, error);
    return { ...result, error: true };
  }
}

/**
 * 내 웨이팅 정보를 불러온다. 입장까지 몇 번째 순서인지 알 수 있다.
 * 
 * @param {*} floor 
 * @param {*} accessToken 
 * @returns 
 */
async function fetchMyWaiting(floor, accessToken) {
  const result = createResult(floor.id);
  
  try {
    const myWaitingResponse = await floorStatusApi.myWaitingRequest(floor, accessToken);
    if (!myWaitingResponse.ok) {
      console.log(`Failed to fetch ${floor.api}/waitings: ${myWaitingResponse.status}`);
      return { ...result, error: true };
    }

    const myWaitingData = await myWaitingResponse.json();
    return myWaitingData.length === 0 
      ? result 
      : { ...result, waitingCount: myWaitingData[0]?.remaining_waitings_count, hasMyWaiting: true };
  } catch (error) {
    console.error(`Error fetching my waiting for floor ${floor.id}:`, error);
    return { ...result, error: true };
  }
}

/**
 * 불러온 웨이팅 정보를 화면에 표시한다.
 * 
 * @param {} result 
 * @returns 
 */
function updateWaitingDisplay(result) {
  const element = document.getElementById(result.id);

  if (result.error) {
    element.textContent = "Error";
    return;
  }

  const waitingCount = result.waitingCount;
  let displayText;
  if (result.hasMyWaiting) {
    if (waitingCount === -1) {
      displayText = "<strong>지금 입장</strong>"; // TODO: 실제 API 응답 확인 필요
    } else if (waitingCount === 0) {
      displayText = "<strong>다음 입장</strong>";
    } else if (waitingCount >= 1) {
      displayText = `대기 <strong>${waitingCount + 1}번째</strong>`;
    } else {
      displayText = "N/A";
    }

    element.classList.remove('floor-status');
    element.classList.add('my-floor-status');
  } else {
    if (waitingCount === 0) {
      displayText = "<strong>바로 입장</strong>";
    } else if (waitingCount) {
      displayText = `대기 <strong>${waitingCount}팀</strong>`;
    } else {
      displayText = "N/A";
    }
  }
  element.innerHTML = displayText;
}

/**
 * 새로고침 버튼을 누르면 대기 인원이 새로고침된다.
 * 
 * @param {*} reloadId 
 * @param {*} rotateAnimationClassName 
 */
async function addClickEventToReload(reloadId, rotateAnimationClassName) {
  const reloadElement = document.getElementById(reloadId);

  reloadElement.addEventListener('click', () => {
    reloadElement.classList.add(rotateAnimationClassName);

    setTimeout(() => {
      reloadElement.classList.remove(rotateAnimationClassName);
    }, 1000 * 0.5); // 0.5초

    const selectedValue = document.getElementById(HTML_ID.select).value;
    checkValue(selectedValue);
  });
}

/**
 * 현재 시간이 백화점 영업 시간 내인지 확인하는 함수
 * 
 * @returns boolean
 */
function isEveryStoreOpen() {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const currentHour = koreaTime.getHours();
  const currentMinute = koreaTime.getMinutes();
  const currentDay = koreaTime.getDay() // 0(일요일) ~ 6(토요일)

  // 월 ~ 목 영업시간 : 10:30 ~ 8:00
  if (currentDay >= 1 && currentDay <= 4) {
    return (currentHour > 10 || (currentHour === 10 && currentMinute >= 30)) 
            && currentHour < 20
        ? true : false;
  }

  // 금 ~ 일 영업시간 : 10:30 ~ 8:30
  else {
    return (currentHour > 10 || (currentHour === 10 && currentMinute >= 30))
            && (currentHour < 20 || (currentHour === 20 && currentMinute < 30))
       ? true : false;
  }
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
    Object.entries(OPTIONS).forEach(([key, value]) => {
      fetchAllWaitingCounts(key, value.accesstoken)
    });
  }, timeout);
}

// TODO: main.js, export function?
handleStoreStatus();
addClickEventToReload(HTML_ID.reload, HTML_CLASS_NAME_ROTATE_ANIMATION);
refreshAt(10, 30, 1);