"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Props for the Modal component.
 */
interface Props {
    /** Determines if the modal is currently visible. */
    isOpen: boolean;
    /** Callback function triggered when the modal requests to be closed (e.g., clicking X, pressing Esc, or clicking outside). */
    onClose: () => void;
    /** The title displayed in the modal header. */
    title: string;
    /** The content rendered inside the modal body. */
    children: ReactNode;
    /** Optional content rendered in the modal footer. */
    footer?: ReactNode;
    /** Size preset for the modal, dictating its maximum width. Default is "md". */
    size?: "sm" | "md" | "lg";
}

/**
 * A reusable portal-based Modal component.
 * Features:
 * - Uses React portals to render outside the main DOM hierarchy (appended to document.body).
 * - Close-on-escape built-in.
 * - Backdrop click to close.
 * 
 * @param {Props} props - Modal configuration.
 * @returns React portal containing the modal, or null if closed/SSR.
 */
export default function Modal({ isOpen, onClose, title, children, footer, size = "md" }: Props) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen || typeof document === "undefined") return null;

    const maxWidth = size === "sm" ? 400 : size === "lg" ? 720 : 540;

    return createPortal(
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content" style={{ maxWidth }}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 18, padding: "4px 8px" }}>×</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}
