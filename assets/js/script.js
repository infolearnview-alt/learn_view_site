'use strict';

document.documentElement.classList.add('js');

const addEventOnElem = function (elem, type, callback) {
  if (!elem) return;

  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

const navToggler = document.querySelector('[data-nav-toggler]');
const navbar = document.querySelector('[data-navbar]');
const navbarLinks = document.querySelectorAll('[data-nav-link]');

const toggleNavbar = function () {
  navbar.classList.toggle('active');
  navToggler.classList.toggle('active');
};

const closeNavbar = function () {
  navbar.classList.remove('active');
  navToggler.classList.remove('active');
};

addEventOnElem(navToggler, 'click', toggleNavbar);
addEventOnElem(navbarLinks, 'click', closeNavbar);

const header = document.querySelector('[data-header]');
const backTopBtn = document.querySelector('[data-back-top-btn]');

const activeElemOnScroll = function () {
  if (window.scrollY > 100) {
    header.classList.add('active');
    backTopBtn.classList.add('active');
  } else {
    header.classList.remove('active');
    backTopBtn.classList.remove('active');
  }
};

addEventOnElem(window, 'scroll', activeElemOnScroll);

const revealElems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  revealElems.forEach((elem) => elem.classList.add('visible'));
} else if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElems.forEach((elem) => revealObserver.observe(elem));
} else {
  revealElems.forEach((elem) => elem.classList.add('visible'));
}

const bookingForm = document.querySelector('[data-booking-form]');
const formSuccess = document.querySelector('[data-form-success]');
const BOOKING_SUCCESS_MESSAGE = 'Thank you. Your booking request has been sent to LearnView. We will contact you shortly.';
const BOOKING_FAILURE_MESSAGE = 'Booking request could not be sent. Please try again or contact LearnView on WhatsApp.';

function configuredAppsScriptUrl() {
  const explicitUrl = (window.LEARNVIEW_APPS_SCRIPT_URL || '').trim();

  if (explicitUrl) return explicitUrl;

  try {
    const nexusState = JSON.parse(localStorage.getItem('learnview-nexus-state-v3') || '{}');
    return (nexusState.settings && nexusState.settings.apiUrl || '').trim();
  } catch (error) {
    return '';
  }
}

function setBookingStatus(message, type) {
  if (!formSuccess) return;

  formSuccess.textContent = message;
  formSuccess.classList.remove('success', 'error');
  formSuccess.classList.add('active', type);
}

function buildBookingPayload(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  return {
    id: `BOOK-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    parentEmail: (data.parentEmail || '').trim(),
    studentName: (data.studentName || '').trim(),
    subject: (data.subject || '').trim(),
    lessonType: data.lessonType || '',
    attendanceType: data.attendanceType || '',
    preferredDate: data.preferredDate || '',
    preferredTime: data.preferredTime || '',
    notes: (data.notes || '').trim(),
    status: 'Pending'
  };
}

async function sendBookingRequest(bookingData) {
  const url = configuredAppsScriptUrl();

  if (!url) {
    throw new Error('LearnView Apps Script URL is not configured.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'POST',
      sheet: 'BookingRequests',
      payload: bookingData
    })
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.ok === false) {
    throw new Error(result?.error || 'Booking request failed.');
  }

  return result;
}

addEventOnElem(bookingForm, 'submit', async function (event) {
  event.preventDefault();

  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const bookingData = buildBookingPayload(bookingForm);

  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  formSuccess?.classList.remove('active', 'success', 'error');

  try {
    await sendBookingRequest(bookingData);
    bookingForm.reset();
    setBookingStatus(BOOKING_SUCCESS_MESSAGE, 'success');
  } catch (error) {
    console.error(error);
    setBookingStatus(BOOKING_FAILURE_MESSAGE, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Booking Request';
  }
});
