export class FloorStatusApi {
  async myWaitingRequest(floor, accessToken) {
    return await fetch(`${floor.api}/waitings`, {
      method: "GET",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
      },
    });
  }

  async defaultWaitingRequest(floor, accessToken) {
    return await fetch(floor.api, {
      method: "GET",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
      },
    });
  }
}