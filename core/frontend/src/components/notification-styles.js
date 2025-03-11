export const notificationStyles = /*css*/ `
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notification {
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
  }

  .notification.show {
    opacity: 1;
    transform: translateX(0);
  }

  .notification::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.5);
    animation: countdown 3s linear forwards;
  }

  .notification.error {
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  }

  .notification.success {
    background: linear-gradient(135deg, #00C851 0%, #007E33 100%);
  }

  .notification.info {
    background: linear-gradient(135deg, #33b5e5 0%, #0099CC 100%);
  }

  .notification .icon {
    font-size: 1.2rem;
  }

  .notification .message {
    flex: 1;
  }

  .notification .close-btn {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .notification .close-btn:hover {
    opacity: 1;
  }

  @keyframes countdown {
    from { width: 100%; }
    to { width: 0%; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  .notification.error.shake {
    animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
`; 