import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ConfirmDialog from '../components/admin/ConfirmDialog';

describe('Admin ConfirmDialog Component Tests', () => {
  test('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders dialog title and message when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Product"
        message="This action will deactivate the catalog item."
      />
    );

    expect(screen.getByText('Delete Product')).toBeInTheDocument();
    expect(
      screen.getByText('This action will deactivate the catalog item.')
    ).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Order Transition"
        confirmText="Yes, Proceed"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = screen.getByText('Yes, Proceed');
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        cancelText="Discard"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByText('Discard');
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
