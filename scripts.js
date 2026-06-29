// ===== FOCUS TRAP UTILITIES (Accessibility - WCAG 2.2 AA) =====
var _trapFocusHandler = null;
var _lastFocusedElement = null;

function getFocusableElements(containerEl) {
    var selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(containerEl.querySelectorAll(selector));
}

function trapFocus(containerEl) {
    releaseFocusTrap(); // clear any existing trap first
    var focusable = getFocusableElements(containerEl);
    if (focusable.length === 0) return;

    // Focus the first focusable element
    focusable[0].focus();

    _trapFocusHandler = function (e) {
        if (e.key !== 'Tab') return;

        var currentFocusable = getFocusableElements(containerEl);
        if (currentFocusable.length === 0) return;

        var firstEl = currentFocusable[0];
        var lastEl = currentFocusable[currentFocusable.length - 1];

        if (e.shiftKey) {
            // Shift+Tab: if on first element, wrap to last
            if (document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        } else {
            // Tab: if on last element, wrap to first
            if (document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    };

    containerEl.addEventListener('keydown', _trapFocusHandler);
}

function releaseFocusTrap() {
    if (_trapFocusHandler) {
        // Remove the handler from whichever element had it
        // We store it globally so we just clear the reference
        document.removeEventListener('keydown', _trapFocusHandler);
        _trapFocusHandler = null;
    }
}

// ===== EXIT-INTENT MODAL FOCUS MANAGEMENT =====
function showExitModal() {
    var modal = document.getElementById('exit-intent-modal');
    if (!modal) return;

    _lastFocusedElement = document.activeElement;
    modal.hidden = false;
    trapFocus(modal);
}

function hideExitModal() {
    var modal = document.getElementById('exit-intent-modal');
    if (!modal) return;

    releaseFocusTrap();
    modal.hidden = true;

    // Restore focus
    if (_lastFocusedElement && _lastFocusedElement.focus) {
        _lastFocusedElement.focus();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // 1. Smooth Scrolling for Navigation Links
    var links = document.querySelectorAll('.nav-link, .logo-link');

    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = link.getAttribute('href');

            // Only handle internal anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                var targetId = href.substring(1);
                var targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Close mobile menu if open
                    var navList = document.querySelector('.nav-list');
                    var navToggle = document.querySelector('.mobile-nav-toggle');
                    if (navList && navList.getAttribute('data-visible') === 'true') {
                        releaseFocusTrap();
                        navList.setAttribute('data-visible', 'false');
                    }
                    if (navToggle) {
                        navToggle.setAttribute('aria-expanded', 'false');
                    }

                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 2. Mobile Menu Toggle (with focus trap)
    var navToggle = document.querySelector('.mobile-nav-toggle');
    var navList = document.querySelector('.nav-list');

    if (navToggle && navList) {
        navToggle.addEventListener('click', function () {
            var isVisible = navList.getAttribute('data-visible') === 'true';
            var opening = !isVisible;

            navList.setAttribute('data-visible', String(opening));
            navToggle.setAttribute('aria-expanded', String(opening));

            if (opening) {
                _lastFocusedElement = document.activeElement;
                trapFocus(navList);
            } else {
                releaseFocusTrap();
                navToggle.focus();
            }
        });

        // Close mobile menu on click outside (the 30% overlay gap)
        document.addEventListener('click', function (e) {
            if (navList.getAttribute('data-visible') === 'true') {
                var isNavClick = navList.contains(e.target);
                var isToggleClick = navToggle.contains(e.target);
                if (!isNavClick && !isToggleClick) {
                    releaseFocusTrap();
                    navList.setAttribute('data-visible', 'false');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.focus();
                }
            }
        });

        // Close mobile menu on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navList.getAttribute('data-visible') === 'true') {
                releaseFocusTrap();
                navList.setAttribute('data-visible', 'false');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // 3. Update Footer Year
    var yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 4. Exit-Intent Modal (trigger on mouse leave viewport)
    var exitModal = document.getElementById('exit-intent-modal');
    if (exitModal) {
        // Wire up close button
        var closeBtn = exitModal.querySelector('.exit-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideExitModal);
        }

        // Wire up "No thanks" button
        var noThanksBtn = exitModal.querySelector('.btn-primary');
        if (noThanksBtn) {
            noThanksBtn.addEventListener('click', hideExitModal);
        }

        // Close modal on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !exitModal.hidden) {
                hideExitModal();
            }
        });

        // Exit-intent: show modal when mouse leaves top of viewport
        // Only show once per session
        var exitShown = sessionStorage.getItem('exitModalShown');
        if (!exitShown) {
            document.addEventListener('mouseout', function (e) {
                if (e.clientY <= 0 && !exitModal.hidden) {
                    showExitModal();
                    sessionStorage.setItem('exitModalShown', '1');
                }
            });
        }
    }

    // 5. Contact Form Handling (with per-field error messages)
    var contactForm = document.getElementById('contact-form');
    var formStatus = document.getElementById('form-status');

    // Helper: show error on a specific field
    function showFieldError(inputEl, message) {
        var errorId = inputEl.id + '-error';
        var errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
        }
        inputEl.setAttribute('aria-invalid', 'true');
        inputEl.classList.add('input-error');
    }

    // Helper: clear error on a specific field
    function clearFieldError(inputEl) {
        var errorId = inputEl.id + '-error';
        var errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = '';
        }
        inputEl.removeAttribute('aria-invalid');
        inputEl.classList.remove('input-error');
    }

    // Helper: clear all field errors
    function clearAllErrors() {
        var inputs = contactForm.querySelectorAll('.form-control');
        inputs.forEach(function (input) {
            clearFieldError(input);
        });
        formStatus.textContent = '';
        formStatus.className = 'form-status';
    }

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous errors
            clearAllErrors();

            var nameInput = contactForm.querySelector('#name');
            var emailInput = contactForm.querySelector('#email');
            var messageInput = contactForm.querySelector('#message');
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var firstError = null;

            // Validate name
            if (!nameInput.value.trim()) {
                showFieldError(nameInput, 'Please enter your name.');
                if (!firstError) firstError = nameInput;
            }

            // Validate email
            if (!emailInput.value.trim()) {
                showFieldError(emailInput, 'Please enter your email address.');
                if (!firstError) firstError = emailInput;
            } else if (!emailPattern.test(emailInput.value.trim())) {
                showFieldError(emailInput, 'Please enter a valid email address.');
                if (!firstError) firstError = emailInput;
            }

            // Validate message
            if (!messageInput.value.trim()) {
                showFieldError(messageInput, 'Please describe your problem.');
                if (!firstError) firstError = messageInput;
            }

            // If errors, focus first and show summary
            if (firstError) {
                firstError.focus();
                formStatus.textContent = 'Please fix the errors below.';
                formStatus.className = 'form-status text-error';
                return;
            }

            // Show sending state
            formStatus.textContent = 'Sending your message...';
            formStatus.className = 'form-status text-accent';

            /*
             * TODO: Connect to a form service.
             * Replace this simulated submission with a real fetch() call:
             *
             *   fetch('https://formspree.io/f/yourFormID', {
             *       method: 'POST',
             *       body: new FormData(contactForm),
             *       headers: { 'Accept': 'application/json' }
             *   })
             *   .then(...)
             */

            var name = nameInput.value.trim();
            setTimeout(function () {
                formStatus.textContent = 'Thank you, ' + name + '! Your message has been sent. I will respond as soon as possible.';
                formStatus.className = 'form-status text-success';
                contactForm.reset();
                clearAllErrors();

                // Clear success message after 8 seconds
                setTimeout(function () {
                    formStatus.textContent = '';
                }, 8000);
            }, 1500);
        });
    }
});
