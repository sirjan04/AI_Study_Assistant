// public/js/main.js — Client-side JavaScript for AI Study Assistant

// ── AUTO-DISMISS FLASH MESSAGES ────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const flashMsgs = document.querySelectorAll('.flash-alert');
  flashMsgs.forEach(msg => {
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateX(100%)';
      msg.style.transition = 'all 0.5s ease';
      setTimeout(() => msg.remove(), 500);
    }, 4000);
  });
});
