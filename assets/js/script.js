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

addEventOnElem(bookingForm, 'submit', function (event) {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(bookingForm).entries());
  const bookings = JSON.parse(localStorage.getItem('learnview-booking-requests') || '[]');

  bookings.push({
    ...data,
    createdAt: new Date().toISOString(),
    source: 'LearnView public website'
  });

  localStorage.setItem('learnview-booking-requests', JSON.stringify(bookings));
  bookingForm.reset();

  formSuccess.textContent = 'Thank you. Your booking request has been captured. LearnView will follow up to confirm availability.';
  formSuccess.classList.add('active');
});
