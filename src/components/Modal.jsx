import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/modal.css';

/**
 * Reusable Modal Component
 *
 * Props:
 *   isOpen    {boolean}    - Controls visibility
 *   onClose   {function}   - Called when overlay or close button is clicked
 *   title     {string}     - Modal heading
 *   subtitle  {string}     - Optional sub-heading below title
 *   footer    {ReactNode}  - Action buttons rendered in the sticky footer
 *   maxWidth  {string}     - Optional CSS max-width override (default: 820px)
 *   children  {ReactNode}  - Form / body content (scrollable)
 */
const Modal = ({ isOpen, onClose, title, subtitle, footer, maxWidth, children }) => {
    // Lock background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="app-modal-overlay" onClick={onClose}>
            <div
                className="app-modal"
                style={maxWidth ? { maxWidth } : undefined}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="app-modal__header">
                    <div className="app-modal__title-group">
                        <h2 className="app-modal__title">{title}</h2>
                        {subtitle && <p className="app-modal__subtitle">{subtitle}</p>}
                    </div>
                    <button className="app-modal__close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="app-modal__body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="app-modal__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
