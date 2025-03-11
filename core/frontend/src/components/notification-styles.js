export const notificationStyles = /*css*/ `
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .notification {
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translateX(100%) scale(0.95);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    pointer-events: auto;
    max-width: 400px;
    margin: 0 auto;
  }

  .notification.show {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  .notification::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
  }

  .notification::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.7);
    transform-origin: left;
    animation: countdown linear forwards;
    animation-duration: inherit;
  }

  .notification.success {
    background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  }

  .notification.error {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  }

  .notification.info {
    background: linear-gradient(135deg, #33b5e5 0%, #0099CC 100%);
  }

  .notification .icon {
    font-size: 1.2rem;
    min-width: 20px;
    text-align: center;
  }

  .notification .message {
    flex: 1;
    margin-right: 10px;
  }

  .notification .close-btn {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    padding: 5px;
  }

  .notification .close-btn:hover {
    opacity: 1;
  }

  @keyframes countdown {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }

  .notification.error.shake {
    animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
`; 