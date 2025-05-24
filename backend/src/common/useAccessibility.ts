import { useEffect } from 'react';

/**
 * Custom hook to improve accessibility by adding keyboard navigation
 * and screen reader support to components
 */
export function useAccessibility(options = {}) {
  const {
    trapFocus = false,
    ariaLive = false,
    ariaLiveMessage = '',
    escapeToClose = false,
    onEscape = () => {},
  } = options;

  useEffect(() => {
    // Handle aria-live announcements
    if (ariaLive && ariaLiveMessage) {
      const liveRegion = document.getElementById('aria-live-region');
      if (liveRegion) {
        liveRegion.textContent = ariaLiveMessage;
      } else {
        // Create aria-live region if it doesn't exist
        const newLiveRegion = document.createElement('div');
        newLiveRegion.id = 'aria-live-region';
        newLiveRegion.className = 'sr-only';
        newLiveRegion.setAttribute('aria-live', 'polite');
        newLiveRegion.setAttribute('aria-atomic', 'true');
        newLiveRegion.textContent = ariaLiveMessage;
        document.body.appendChild(newLiveRegion);
      }
    }

    // Handle escape key press
    const handleKeyDown = (e) => {
      if (escapeToClose && e.key === 'Escape') {
        onEscape();
      }
    };

    // Set up trap focus if needed
    if (trapFocus) {
      // Implementation of focus trapping
      const handleFocusTrap = (e) => {
        // This would be implemented to keep focus within a modal or dialog
        // by capturing tab events and redirecting focus as needed
      };

      document.addEventListener('keydown', handleFocusTrap);
      return () => {
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [trapFocus, ariaLive, ariaLiveMessage, escapeToClose, onEscape]);

  return {
    // Return accessibility props that can be spread onto components
    getButtonProps: (props = {}) => ({
      role: 'button',
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          props.onClick?.(e);
        }
        props.onKeyDown?.(e);
      },
      ...props,
    }),
    
    // Props for modal or dialog
    getDialogProps: (props = {}) => ({
      role: 'dialog',
      'aria-modal': true,
      tabIndex: -1,
      ...props,
    }),
    
    // Props for form inputs with labels
    getLabeledInputProps: (props = {}) => {
      const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
      return {
        inputProps: {
          id,
          'aria-describedby': props['aria-describedby'],
          ...props,
        },
        labelProps: {
          htmlFor: id,
        },
      };
    },
  };
}
