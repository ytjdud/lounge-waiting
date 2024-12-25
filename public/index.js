import { ContactNumbers, ExternalLinks } from './enum.js';

const accessToken = "access-token";
const endpoints = [
  { id: "gangnam10F", url: "https://nowwaiting.co/web_api/v1/spots/14406" },
  { id: "gangnam7F", url: "https://nowwaiting.co/web_api/v1/spots/15533" },
  { id: "upperHouse", url: "https://nowwaiting.co/web_api/v1/spots/18431" },
  { id: "myeongDong", url: "https://nowwaiting.co/web_api/v1/spots/15824" },
  { id: "timeSquare", url: "https://nowwaiting.co/web_api/v1/spots/16982" },
  { id: "southCity", url: "https://nowwaiting.co/web_api/v1/spots/18136" },
];

async function fetchWaitingCount() {
  try {
    // 모든 API 요청을 병렬로 실행
    const promises = endpoints.map((endpoint) =>
      fetch(endpoint.url, {
        method: "GET",
        headers: {
          "Access-Token": accessToken,
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          "Accept-Encoding" : "gzip, deflate, br, zstd",
          "Connection": "keep-alive"
        },
      })
        .then((response) => {
          if(!response.ok) {
            console.error(`Failed to fetch ${endpoint.url}:`, response.status);
            return { id: endpoint.id, error: true };
          }
          return response.json().then((data) => ({
            id: endpoint.id,
            waitingCount: data.waiting_info?.queued_waitings_count,
          }));
        })
        .catch((error) => {
          console.error(`Error fetching ${endpoint.url}:`, error);
          return { id: endpoint.id, error: true };
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