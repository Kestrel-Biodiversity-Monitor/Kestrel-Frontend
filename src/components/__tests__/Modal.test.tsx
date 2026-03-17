import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal component', () => {
    it('does not render when isOpen is false', () => {
        render(
            <Modal isOpen={false} onClose={() => {}} title="Test Title">
                <p>Modal Content</p>
            </Modal>
        );
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
        expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders correctly when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={() => {}} title="Test Title">
                <p>Modal Content</p>
            </Modal>
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const handleClose = jest.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} title="Test Title">
                <p>Modal Content</p>
            </Modal>
        );
        
        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders a footer when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={() => {}}
                title="Test Title"
                footer={<button>Confirm</button>}
            >
                <p>Modal Content</p>
            </Modal>
        );
        expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
});
