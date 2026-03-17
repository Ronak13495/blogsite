(function () {
  'use strict';

  let allPosts = [];
  let query = '';

  const grid         = document.getElementById('posts-grid');
  const loading      = document.getElementById('loading');
  const noResults    = document.getElementById('no-results');
  const searchInput  = document.getElementById('search-input');
  const resultsCount = document.getElementById('results-count');

  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');
  const modalTitle   = document.getElementById('modal-title');
  const modalBody    = document.getElementById('modal-body');
  const modalMeta    = document.getElementById('modal-meta');
  const modalAuthor  = document.getElementById('modal-author');
  const modalAvatar  = document.getElementById('modal-avatar');

  const contactForm  = document.getElementById('contact-form');
  const formSuccess  = document.getElementById('form-success');

  async function fetchPosts() {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!res.ok) throw new Error('Network response was not ok');
      allPosts = await res.json();
      loading.classList.add('hidden');
      renderPosts(allPosts);
    } catch (err) {
      loading.textContent = 'Failed to load posts. Please try again later.';
      console.error('Fetch error:', err);
    }
  }

  function renderPosts(posts) {
    grid.innerHTML = '';

    if (posts.length === 0) {
      noResults.classList.remove('hidden');
      resultsCount.textContent = '';
      return;
    }

    noResults.classList.add('hidden');
    resultsCount.textContent = posts.length + ' post' + (posts.length !== 1 ? 's' : '');

    posts.forEach(function (post, i) {
      const card = document.createElement('article');
      card.className = 'post-card';
      card.style.animationDelay = Math.min(i * 30, 600) + 'ms';

      const highlightedTitle = highlight(capitalise(post.title), query);
      const numLabel = String(post.id).padStart(2, '0');

      card.innerHTML =
        '<span class="post-tag">Post #' + numLabel + '</span>' +
        '<h3 class="post-title">' + highlightedTitle + '</h3>' +
        '<p class="post-excerpt">' + capitalise(post.body) + '</p>' +
        '<button class="read-more-btn" aria-label="Read more about ' + post.title + '">' +
          'Read More' +
          '<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
        '</button>';

      // Both the title and the button open the modal
      card.querySelector('.post-title').addEventListener('click', function () { openModal(post); });
      card.querySelector('.read-more-btn').addEventListener('click', function () { openModal(post); });

      grid.appendChild(card);
    });
  }

  let debounceTimer;
  searchInput.addEventListener('input', function (e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      query = e.target.value.trim().toLowerCase();
      const filtered = allPosts.filter(function (p) {
        return p.title.toLowerCase().includes(query);
      });
      renderPosts(filtered);
    }, 200);
  });

  function openModal(post) {
    modalMeta.textContent   = 'Post #' + String(post.id).padStart(2, '0') + ' · User ' + post.userId;
    modalTitle.textContent  = capitalise(post.title);
    modalBody.textContent   = capitalise(post.body);
    modalAuthor.textContent = 'Author · User ' + post.userId;
    modalAvatar.textContent = String(post.userId);
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      try {
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString(),
        });
        contactForm.reset();
        formSuccess.classList.remove('hidden');
        setTimeout(function () { formSuccess.classList.add('hidden'); }, 6000);
      } catch {
        alert('Something went wrong. Please try again.');
      }
    });
  }

  function capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function highlight(text, term) {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
  }

  fetchPosts();
})();
