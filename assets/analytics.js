/* Logistream — conversion tracking.
   Provider-agnostic: fires into Plausible or Umami if one of them is loaded,
   and stays completely inert if neither is. Nothing is sent anywhere until
   you add the provider script in the <head> of the pages.

   To activate (after signing up), add ONE of these lines to each page:

   Plausible:
     <script defer data-domain="logistream.it" src="https://plausible.io/js/script.js"></script>
   Umami:
     <script defer src="https://YOUR-UMAMI-HOST/script.js" data-website-id="YOUR-ID"></script>
*/
(function () {
  function track(name, props) {
    try {
      if (typeof window.plausible === 'function') {
        window.plausible(name, props ? { props: props } : undefined);
      } else if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track(name, props || {});
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    // the one action that matters: someone starting an email
    if (href.indexOf('mailto:') === 0) {
      track('Email click', { position: a.closest('.article-cta') ? 'guide-cta'
                                     : a.closest('footer') ? 'footer'
                                     : a.closest('.email-card') ? 'contact-card'
                                     : 'other' });
      return;
    }

    if (href.indexOf('linkedin.com') > -1) { track('LinkedIn click'); return; }

    // language switching tells you which version people actually want
    if (a.closest('.lang-switch')) {
      track('Language switch', { to: (a.textContent || '').trim() });
    }
  }, true);

  // did anyone actually read the guide, or just land and leave?
  var article = document.querySelector('.article-body');
  if (article) {
    var fired = false;
    window.addEventListener('scroll', function () {
      if (fired) return;
      var seen = window.scrollY + window.innerHeight;
      if (seen > article.offsetTop + article.offsetHeight * 0.7) {
        fired = true;
        track('Guide read', { page: document.documentElement.lang });
      }
    }, { passive: true });
  }
})();
