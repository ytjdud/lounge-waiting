export const ContactNumbers = Object.freeze({
  "신강 7층": "02-3479-1020",
  "본점 13층": "02-310-1020",
  "타임스퀘어": "02-2639-1060"
})

export const StoreInfos = {
  GANGNAM: {
    name: "강남점",
    floors: [
      { label: "10층", id: "gangnam10F", 
        api: "https://nowwaiting.co/web_api/v1/spots/14406",
        url: "https://store.nowwaiting.co/spots/14406" },
      { label: "7층", id: "gangnam7F", 
        api: "https://nowwaiting.co/web_api/v1/spots/15533", 
        url: "https://store.nowwaiting.co/spots/15533" },
      { label: "어퍼", id: "upperHouse", 
        api: "https://nowwaiting.co/web_api/v1/spots/18431",
        url: "https://store.nowwaiting.co/spots/18431" },
    ],
  },
  MYEONGDONG: {
    name: "본점",
    floors: [{ label: "13층", id: "myeongDong", 
      api: "https://nowwaiting.co/web_api/v1/spots/15824",
      url: "https://store.nowwaiting.co/spots/15824" }],
  },
  TIMESQUARE: {
    name: "타임스퀘어",
    floors: [{ label: "10층", id: "timeSquare", 
      api: "https://nowwaiting.co/web_api/v1/spots/16982",
      url: "https://store.nowwaiting.co/spots/16982" }],
  },
  SOUTHCITY: {
    name: "사우스시티",
    floors: [{ label: "2층", id: "southCity", 
      api: "https://nowwaiting.co/web_api/v1/spots/18136",
      url: "https://store.nowwaiting.co/spots/18136" }],
  },
};