# LearnView Public Website

Static GitHub Pages website for LearnView tutoring services.

## Pages and Sections

- Home
- Services
- About
- Book a Session
- Testimonials
- Contact

## Booking Form

The booking form posts new requests to the LearnView Nexus Apps Script backend and writes them to the `BookingRequests` sheet.

Set the deployed Apps Script web app URL in:

```js
assets/js/config.js
```

Use the same `/exec` URL that is saved in LearnView Nexus **Connection Setup**.

## Deployment

Publish the repository with GitHub Pages from the `main` branch and root folder.
