import { generateControllerHTML, generateStoreHTML } from './generateHTML.js';
import { addClickEventToFloorStatus, addClickEventToContact } from './eventHandler.js';
import { handleStoreStatus, addClickEventToReload, refreshAt } from './floorstatus.js';
import {
  STORE_INFO,
  HTML_ID, HTML_CLASS_NAME
} from './enum.js';

const stores = Object.values(STORE_INFO);

generateControllerHTML();
generateStoreHTML(stores);

document.addEventListener("DOMContentLoaded", () => {
  addClickEventToFloorStatus(stores);
  addClickEventToContact(stores);

  handleStoreStatus(HTML_ID.select);
  addClickEventToReload(HTML_ID.reload, HTML_CLASS_NAME.rotatinganimation, HTML_ID.select);
  refreshAt(10, 30, 1);
});