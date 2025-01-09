/**
 * Floor Status를 누르면 실제 나우웨이팅 페이지로 이동한다.
 * 
 */
export function addClickEventToFloorStatus(stores) {
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
export function addClickEventToContact(stores) {
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