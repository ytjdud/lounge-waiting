import { ContactNumbers, ExternalLinks } from './enum.js';

document.addEventListener("DOMContentLoaded", () => {
  const buttonQueueContainer = document.getElementById("button-queue-container");
  const buttonCallContainer = document.getElementById("button-call-container");

  Object.entries(ExternalLinks).forEach(([location, link]) => {
    const button = document.createElement("a");
    button.href = `${link}`;
    button.target= `_blank`;
    button.className = `button`;
    button.textContent = location;
    buttonQueueContainer.appendChild(button);
  })

  Object.entries(ContactNumbers).forEach(([location, number]) => {
    const button = document.createElement("a");
    button.href = `tel:${number}`;
    button.className = `button`;
    button.textContent = location;
    buttonCallContainer.appendChild(button);
  });
});