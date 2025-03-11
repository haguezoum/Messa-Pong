export class ToastNotification extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.activeToasts = new Set();
    }

    static get styles() {
        return /*css*/ `
            :host {
                position: fixed;
                z-index: 9999;
            }

            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .toast {
                min-width: 300px;
                max-width: 400px;
                background: white;
                border-radius: 12px;
                padding: 16px;
                margin: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
                overflow: hidden;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.success {
                border-left: 4px solid #28a745;
            }

            .toast.error {
                border-left: 4px solid #dc3545;
            }

            .toast.info {
                border-left: 4px solid #17a2b8;
            }

            .toast-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }

            .toast.success .toast-icon {
                background: #28a745;
            }

            .toast.error .toast-icon {
                background: #dc3545;
            }

            .toast.info .toast-icon {
                background: #17a2b8;
            }

            .toast-content {
                flex-grow: 1;
            }

            .toast-title {
                font-weight: 600;
                font-size: 1rem;
                margin: 0 0 4px;
                color: #1a1a1a;
            }

            .toast-message {
                font-size: 0.875rem;
                color: #666;
                margin: 0;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
            }

            .toast-progress::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: currentColor;
                animation: progress linear forwards;
            }

            .toast.success .toast-progress::after {
                background: #28a745;
            }

            .toast.error .toast-progress::after {
                background: #dc3545;
            }

            .toast.info .toast-progress::after {
                background: #17a2b8;
            }

            .close-btn {
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                padding: 4px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.05);
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-btn:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
            }

            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }

            @keyframes slideIn {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes fadeOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(120%); opacity: 0; }
            }
        `;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${ToastNotification.styles}</style>
            <div class="toast-container"></div>
        `;
    }

    show({ title, message, type = 'info', duration = 3000 }) {
        // Clear existing toasts
        this.clearAll();

        const container = this.shadowRoot.querySelector('.toast-container');
        const toast = document.createElement('div');
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
            <button class="close-btn">✕</button>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);
        this.activeToasts.add(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
            toast.querySelector('.toast-progress').style.animation = `progress ${duration}ms linear`;
        });

        // Handle close button
        const closeBtn = toast.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.hide(toast));

        // Auto hide
        setTimeout(() => this.hide(toast), duration);

        return toast;
    }

    hide(toast) {
        if (!toast) return;
        
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            toast.remove();
            this.activeToasts.delete(toast);
        }, 500);
    }

    clearAll() {
        const container = this.shadowRoot.querySelector('.toast-container');
        if (container) {
            container.innerHTML = '';
        }
        this.activeToasts.clear();
    }
}

customElements.define('toast-notification', ToastNotification); 