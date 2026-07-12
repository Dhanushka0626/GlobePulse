/**
 * GlobePulse Core Logic
 * SPA Routing, State Management, Rendering Engines, and Interactions.
 */

// --- STATE MANAGEMENT ---
const state = {
  articles: [],
  bookmarks: [],
  theme: 'dark', // 'dark' | 'light'
  activeCategory: 'All',
  searchQuery: '',
  textSize: 'md', // 'sm' | 'md' | 'lg'
  speechInstance: null
};

// Initial setup to load data
function initStorage() {
  // 1. Load locally created or edited articles
  let localArticles = [];
  const localArticlesRaw = localStorage.getItem('globepulse_local_articles');
  if (localArticlesRaw) {
    localArticles = JSON.parse(localArticlesRaw);
  }

  // 2. Load deleted static article IDs
  let deletedStatic = [];
  const deletedStaticRaw = localStorage.getItem('globepulse_deleted_articles');
  if (deletedStaticRaw) {
    deletedStatic = JSON.parse(deletedStaticRaw);
  }

  // 3. Filter static articles from data.js
  const activeStatic = DEFAULT_ARTICLES.filter(a => !deletedStatic.includes(a.id));

  // 4. Combine: local articles (taking precedence) and static articles
  const combined = [...localArticles, ...activeStatic];
  const uniqueArticles = [];
  const seenIds = new Set();

  for (const art of combined) {
    if (!seenIds.has(art.id)) {
      seenIds.add(art.id);

      // Deep copy to prevent mutating memory reference of DEFAULT_ARTICLES directly
      const articleCopy = JSON.parse(JSON.stringify(art));

      // Merge local views count
      const localViews = parseInt(localStorage.getItem(`globepulse_views_${articleCopy.id}`)) || 0;
      articleCopy.views += localViews;

      // Merge local likes count
      const liked = localStorage.getItem(`globepulse_liked_${articleCopy.id}`);
      if (liked) {
        const likeTracked = localStorage.getItem(`globepulse_like_tracked_${articleCopy.id}`);
        if (!likeTracked) {
          articleCopy.likes += 1;
          localStorage.setItem(`globepulse_like_tracked_${articleCopy.id}`, 'true');
        }
      }

      // Merge and filter comments (local comments + static comments - deleted comments)
      const localCommentsRaw = localStorage.getItem(`globepulse_comments_${articleCopy.id}`);
      let localComments = [];
      if (localCommentsRaw) {
        localComments = JSON.parse(localCommentsRaw);
      }
      
      const deletedComments = JSON.parse(localStorage.getItem(`globepulse_deleted_comments_${articleCopy.id}`) || '[]');
      const allComments = [...(articleCopy.comments || []), ...localComments];
      articleCopy.comments = allComments.filter(c => !deletedComments.includes(c.id));

      uniqueArticles.push(articleCopy);
    }
  }
  
  state.articles = uniqueArticles;

  // Load Bookmarks
  const localBookmarks = localStorage.getItem('globepulse_bookmarks');
  if (localBookmarks) {
    state.bookmarks = JSON.parse(localBookmarks);
  } else {
    state.bookmarks = ['fusion-energy-2026']; // Default bookmarked item
    localStorage.setItem('globepulse_bookmarks', JSON.stringify(state.bookmarks));
  }

  // Load Theme
  const localTheme = localStorage.getItem('globepulse_theme');
  if (localTheme) {
    state.theme = localTheme;
  } else {
    localStorage.setItem('globepulse_theme', state.theme);
  }

  // Set initial theme class
  if (state.theme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon();
  }
}

function saveLocalArticlesToStorage(localArticles) {
  localStorage.setItem('globepulse_local_articles', JSON.stringify(localArticles));
}

function saveBookmarksToStorage() {
  localStorage.setItem('globepulse_bookmarks', JSON.stringify(state.bookmarks));
}

// --- CLIENT SIDE ROUTER ---
const routes = {
  feed: { id: 'feed-view', navId: 'nav-feed' },
  article: { id: 'article-view', navId: null },
  create: { id: 'editor-view', navId: 'nav-create' },
  dashboard: { id: 'dashboard-view', navId: 'nav-dashboard' }
};

function handleRouting() {
  // Cancel speech synthesis if navigating away
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  const hash = window.location.hash || '#/feed';
  
  // Reset search box when routing between top-level pages
  const globalSearchInput = document.getElementById('global-search');
  
  // Hide all sections first
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active-view');
  });
  
  // Deactivate all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Routing Matches
  if (hash.startsWith('#/article/')) {
    // Detailed Article View
    const articleId = hash.substring(10);
    renderArticleDetail(articleId);
    showView('article');
  } else if (hash.startsWith('#/create')) {
    // Editor View
    const urlParams = new URLSearchParams(hash.split('?')[1]);
    const editId = urlParams.get('edit');
    setupEditorView(editId);
    showView('create');
  } else if (hash === '#/dashboard') {
    // Creator Dashboard View
    renderDashboardView();
    showView('dashboard');
  } else {
    // Default: Feed View
    state.activeCategory = 'All';
    state.searchQuery = '';
    if (globalSearchInput) globalSearchInput.value = '';
    renderFeedView();
    showView('feed');
  }
}

function showView(routeName) {
  const route = routes[routeName];
  if (!route) return;

  const viewElement = document.getElementById(route.id);
  if (viewElement) {
    viewElement.classList.add('active-view');
  }

  if (route.navId) {
    const navBtn = document.getElementById(route.navId);
    if (navBtn) navBtn.classList.add('active');
  }
}

// --- DYNAMIC RENDERING: HOME / FEED VIEW ---
function renderFeedView() {
  renderCategoryPills();
  renderArticlesGrid();
  renderTrendingSidebar();
}

function renderCategoryPills() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const categories = ['All', 'World', 'Tech', 'Science', 'Culture', 'Business', 'Health'];
  
  container.innerHTML = categories.map(cat => {
    const isActive = cat === state.activeCategory ? 'active' : '';
    // Count items matching
    let count = 0;
    if (cat === 'All') {
      count = state.articles.length;
    } else {
      count = state.articles.filter(a => a.category.toLowerCase() === cat.toLowerCase()).length;
    }
    return `
      <li>
        <button class="category-pill ${isActive}" data-category="${cat}">
          ${cat} (${count})
        </button>
      </li>
    `;
  }).join('');

  // Add click listeners
  container.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      state.activeCategory = e.currentTarget.getAttribute('data-category');
      renderCategoryPills();
      renderArticlesGrid();
    });
  });
}

function renderArticlesGrid() {
  const featuredContainer = document.getElementById('featured-post');
  const gridContainer = document.getElementById('articles-container');
  if (!gridContainer || !featuredContainer) return;

  // Filter articles based on Category and Search Query
  const filtered = state.articles.filter(article => {
    const matchesCategory = state.activeCategory === 'All' || 
      article.category.toLowerCase() === state.activeCategory.toLowerCase();
      
    const matchesSearch = state.searchQuery === '' || 
      article.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // If empty state
  if (filtered.length === 0) {
    featuredContainer.style.display = 'none';
    gridContainer.innerHTML = `
      <div class="empty-state glass-panel">
        <i class="fa-solid fa-folder-open"></i>
        <h3>No News Found</h3>
        <p style="color: var(--text-secondary); margin-top: 8px;">Try adjusting your keyword search or category filters.</p>
      </div>
    `;
    return;
  }

  // Render Featured Post (only if no active text query search, or standard page load, as it might look weird)
  const featuredArticle = filtered[0];
  const remainingArticles = filtered.slice(1);

  if (state.activeCategory === 'All' && state.searchQuery === '') {
    featuredContainer.style.display = 'block';
    const isBookmarked = state.bookmarks.includes(featuredArticle.id) ? 'bookmarked' : '';
    
    featuredContainer.innerHTML = `
      <div class="featured-card glass-panel">
        <div class="featured-img-container">
          <img src="${featuredArticle.coverImage}" class="featured-img" alt="${featuredArticle.title}">
          <span class="featured-badge">Featured Story</span>
          <button class="bookmark-btn-badge ${isBookmarked}" data-id="${featuredArticle.id}" title="Bookmark Article">
            <i class="fa-solid fa-bookmark"></i>
          </button>
        </div>
        <div class="featured-content">
          <div class="featured-meta">
            <span><i class="fa-solid fa-tag" style="color: var(--brand-primary); margin-right: 4px;"></i> ${featuredArticle.category}</span>
            <span><i class="fa-regular fa-calendar"></i> ${featuredArticle.publishedDate}</span>
            <span><i class="fa-regular fa-clock"></i> ${featuredArticle.readTime}</span>
          </div>
          <h2 class="featured-title">
            <a href="#/article/${featuredArticle.id}">${featuredArticle.title}</a>
          </h2>
          <p class="featured-excerpt">${featuredArticle.summary}</p>
          <div class="card-footer" style="padding-top: 24px;">
            <div class="author-block">
              <img src="${featuredArticle.author.avatar}" class="author-avatar" alt="${featuredArticle.author.name}">
              <div class="author-info">
                <h5>${featuredArticle.author.name}</h5>
                <p>${featuredArticle.author.role}</p>
              </div>
            </div>
            <a href="#/article/${featuredArticle.id}" class="submit-btn" style="padding: 8px 16px;">
              <span>Read Story</span> <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  } else {
    // Hide featured post container if we filtered categories or searched
    featuredContainer.style.display = 'none';
  }

  // Render Remaining/Grid Articles
  const cardsToRender = (state.activeCategory === 'All' && state.searchQuery === '') ? remainingArticles : filtered;

  if (cardsToRender.length === 0 && featuredContainer.style.display === 'block') {
    gridContainer.innerHTML = `
      <div class="empty-state glass-panel" style="grid-column: span 2; padding: 40px;">
        <p style="color: var(--text-secondary);">No other articles available in this section.</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = cardsToRender.map(art => {
    const isBookmarked = state.bookmarks.includes(art.id) ? 'bookmarked' : '';
    return `
      <article class="news-card glass-panel">
        <div class="card-img-container">
          <img src="${art.coverImage}" class="card-img" alt="${art.title}">
          <span class="card-category">${art.category}</span>
          <button class="bookmark-btn-badge ${isBookmarked}" data-id="${art.id}" title="Bookmark Article">
            <i class="fa-solid fa-bookmark"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span><i class="fa-regular fa-calendar"></i> ${art.publishedDate}</span>
            <span><i class="fa-regular fa-clock"></i> ${art.readTime}</span>
          </div>
          <h3 class="card-title">
            <a href="#/article/${art.id}">${art.title}</a>
          </h3>
          <p class="card-summary">${art.summary}</p>
          <div class="card-footer">
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary);">${art.author.name}</span>
            <div class="card-stats">
              <span><i class="fa-regular fa-eye"></i> ${formatNumber(art.views)}</span>
              <span><i class="fa-regular fa-thumbs-up"></i> ${art.likes}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bind Bookmark Button Clicks inside Feed Grid & Featured Story
  document.querySelectorAll('.bookmark-btn-badge').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const articleId = e.currentTarget.getAttribute('data-id');
      toggleBookmark(articleId);
      
      // Toggle CSS visual state immediately
      e.currentTarget.classList.toggle('bookmarked');
    });
  });
}

function renderTrendingSidebar() {
  const container = document.getElementById('trending-container');
  if (!container) return;

  // Sort articles by views descending
  const sorted = [...state.articles].sort((a, b) => b.views - a.views).slice(0, 3);

  container.innerHTML = sorted.map((art, index) => {
    return `
      <div class="trending-item">
        <div class="trending-number">0${index + 1}</div>
        <div class="trending-details">
          <h6><a href="#/article/${art.id}">${art.title}</a></h6>
          <span>${art.category} • ${art.readTime}</span>
        </div>
      </div>
    `;
  }).join('');
}

// --- DYNAMIC RENDERING: DETAILED ARTICLE READER VIEW ---
function renderArticleDetail(articleId) {
  const container = document.getElementById('article-reader-content');
  if (!container) return;

  const article = state.articles.find(a => a.id === articleId);
  if (!article) {
    container.innerHTML = `
      <a href="#/feed" class="article-back-btn"><i class="fa-solid fa-arrow-left"></i> Back to Feed</a>
      <div class="empty-state" style="padding: 40px 0;">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--error);"></i>
        <h3>Article Not Found</h3>
        <p>The requested article ID does not exist or has been deleted.</p>
      </div>
    `;
    return;
  }

  // Increment views locally once per navigation
  article.views += 1;
  const currentViews = parseInt(localStorage.getItem(`globepulse_views_${article.id}`)) || 0;
  localStorage.setItem(`globepulse_views_${article.id}`, currentViews + 1);

  const isBookmarked = state.bookmarks.includes(article.id) ? 'bookmarked' : '';
  const isLiked = localStorage.getItem(`globepulse_liked_${article.id}`) ? 'liked' : '';
  const commentsCount = article.comments ? article.comments.length : 0;

  // Reading Progress Bar handler
  setupProgressTracker();

  container.innerHTML = `
    <!-- Back to Feed link -->
    <a href="#/feed" class="article-back-btn"><i class="fa-solid fa-arrow-left"></i> Back to Feed</a>

    <!-- Top Article Header metadata -->
    <header class="article-header">
      <span class="article-category-badge">${article.category}</span>
      <h1 class="article-title-main">${article.title}</h1>
      
      <!-- Author info block -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 12px;">
        <div class="author-block">
          <img src="${article.author.avatar}" class="author-avatar" alt="${article.author.name}">
          <div class="author-info">
            <h5 style="font-size: 1rem;">By ${article.author.name}</h5>
            <p>${article.author.role} • ${article.publishedDate}</p>
          </div>
        </div>
        
        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 12px; align-items: center;">
          <span><i class="fa-regular fa-clock"></i> ${article.readTime}</span>
          <span>•</span>
          <span><i class="fa-regular fa-eye"></i> ${formatNumber(article.views)} views</span>
        </div>
      </div>
    </header>

    <!-- Reading & Personalization Settings Toolbar -->
    <div class="article-toolbar">
      <div class="reader-settings">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Font Size</span>
        <button class="text-size-btn ${state.textSize === 'sm' ? 'active' : ''}" data-size="sm" title="Small text">A-</button>
        <button class="text-size-btn ${state.textSize === 'md' ? 'active' : ''}" data-size="md" title="Medium text">A</button>
        <button class="text-size-btn ${state.textSize === 'lg' ? 'active' : ''}" data-size="lg" title="Large text">A+</button>
      </div>

      <div class="reader-settings">
        <!-- Read Aloud Speech Synthesizer -->
        <button class="speech-btn" id="reader-speech-trigger">
          <i class="fa-solid fa-volume-high"></i>
          <span>Read Aloud</span>
        </button>
      </div>

      <div class="article-reader-actions">
        <!-- Bookmark -->
        <button class="action-icon-btn ${isBookmarked}" id="reader-bookmark-trigger" title="Bookmark This Article">
          <i class="fa-solid fa-bookmark"></i>
        </button>
        
        <!-- Print -->
        <button class="action-icon-btn" onclick="window.print()" title="Print / PDF Mode">
          <i class="fa-solid fa-print"></i>
        </button>
      </div>
    </div>

    <!-- Article Hero Banner Image -->
    <div class="article-hero-image-box">
      <img src="${article.coverImage}" class="article-hero-image" alt="${article.title}">
    </div>

    <!-- Main Rich Content -->
    <div class="article-text-container size-${state.textSize}" id="article-content-body">
      ${article.content}
    </div>

    <!-- Tags Row -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; border-bottom: 1px solid var(--border-color); padding-bottom: 24px;">
      ${article.tags.map(tag => `<span class="table-badge" style="padding: 4px 12px;">#${tag}</span>`).join('')}
    </div>

    <!-- Reaction & Share Footer -->
    <div class="article-footer-block">
      <div class="reactions-list">
        <!-- Like Reaction Button -->
        <button class="reaction-btn ${isLiked}" id="article-like-btn" data-id="${article.id}">
          <i class="fa-solid fa-thumbs-up"></i>
          <span>Helpful (<strong id="likes-count-label">${article.likes}</strong>)</span>
        </button>
      </div>

      <div class="share-group">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Share article</span>
        <button class="action-icon-btn" onclick="copyArticleLink()" title="Copy Link to Clipboard"><i class="fa-solid fa-link"></i></button>
        <button class="action-icon-btn" onclick="shareAlert('Twitter')" title="Share on Twitter"><i class="fa-brands fa-twitter"></i></button>
        <button class="action-icon-btn" onclick="shareAlert('LinkedIn')" title="Share on LinkedIn"><i class="fa-brands fa-linkedin-in"></i></button>
      </div>
    </div>

    <!-- Interactive Comments Section -->
    <section class="comments-section">
      <h3 class="comments-title">
        <i class="fa-regular fa-comments"></i> Discussion (<span id="comments-count-label">${commentsCount}</span>)
      </h3>
      
      <!-- New Comment Form -->
      <div class="comment-editor">
        <div class="user-avatar-bubble">GP</div>
        <div class="comment-input-area">
          <form id="comment-form-element">
            <textarea class="comment-textarea" id="comment-input-text" placeholder="Write a respectful, insightful comment..." required></textarea>
            <button type="submit" class="submit-btn" style="padding: 8px 18px; float: right;">
              <span>Post Comment</span>
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

      <!-- Comments Thread List -->
      <div class="comments-list" id="article-comments-container">
        <!-- Injected Comments list -->
      </div>
    </section>
  `;

  // Bind Text Sizer actions
  container.querySelectorAll('.text-size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedSize = e.currentTarget.getAttribute('data-size');
      
      // Update UI active buttons
      container.querySelectorAll('.text-size-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      // Update state and element styling class
      state.textSize = selectedSize;
      const contentBody = document.getElementById('article-content-body');
      if (contentBody) {
        contentBody.className = `article-text-container size-${selectedSize}`;
      }
    });
  });

  // Bind Speech Synthesizer Action
  const speechBtn = document.getElementById('reader-speech-trigger');
  if (speechBtn) {
    speechBtn.addEventListener('click', () => {
      toggleReadAloud(article);
    });
  }

  // Bind Bookmark Toggle Action
  const bmkBtn = document.getElementById('reader-bookmark-trigger');
  if (bmkBtn) {
    bmkBtn.addEventListener('click', (e) => {
      const isNowBookmarked = toggleBookmark(article.id);
      bmkBtn.classList.toggle('bookmarked', isNowBookmarked);
    });
  }

  // Bind Like Reaction Action
  const likeBtn = document.getElementById('article-like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      toggleLikeArticle(article);
    });
  }

  // Render Comments discussion thread
  renderArticleComments(article);

  // Bind Comment Submit
  const commentForm = document.getElementById('comment-form-element');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addNewComment(article);
    });
  }
}

function setupProgressTracker() {
  const progress = document.getElementById('reading-progress');
  if (!progress) return;

  // Show reading progress bar on top
  progress.style.width = '0%';
  progress.style.display = 'block';

  const scrollHandler = () => {
    // Only calculate progress if article view is currently active
    const articleView = document.getElementById('article-view');
    if (!articleView || !articleView.classList.contains('active-view')) {
      progress.style.display = 'none';
      window.removeEventListener('scroll', scrollHandler);
      return;
    }

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const pct = (window.scrollY / docHeight) * 100;
      progress.style.width = `${Math.min(pct, 100)}%`;
    }
  };

  window.addEventListener('scroll', scrollHandler);
}

// Read Aloud Text Speech
function toggleReadAloud(article) {
  if (!('speechSynthesis' in window)) {
    alert("Speech Synthesis is not supported in your browser.");
    return;
  }

  const speechBtn = document.getElementById('reader-speech-trigger');
  
  if (window.speechSynthesis.speaking) {
    // Cancel or Pause speech
    window.speechSynthesis.cancel();
    speechBtn.classList.remove('playing');
    speechBtn.querySelector('span').innerText = 'Read Aloud';
    return;
  }

  // Extract clean text content from the HTML content container
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = article.content;
  const rawText = `${article.title}. Written by ${article.author.name}. ${tempDiv.innerText}`;

  const utterance = new SpeechSynthesisUtterance(rawText);
  utterance.rate = 1.0;
  
  utterance.onend = () => {
    speechBtn.classList.remove('playing');
    speechBtn.querySelector('span').innerText = 'Read Aloud';
  };

  utterance.onerror = () => {
    speechBtn.classList.remove('playing');
    speechBtn.querySelector('span').innerText = 'Read Aloud';
  };

  speechBtn.classList.add('playing');
  speechBtn.querySelector('span').innerText = 'Stop Reading';
  window.speechSynthesis.speak(utterance);
}

function toggleLikeArticle(article) {
  const likeKey = `globepulse_liked_${article.id}`;
  const likeTrackedKey = `globepulse_like_tracked_${article.id}`;
  const likeBtn = document.getElementById('article-like-btn');
  const countLabel = document.getElementById('likes-count-label');
  
  if (localStorage.getItem(likeKey)) {
    // Unlike
    localStorage.removeItem(likeKey);
    localStorage.removeItem(likeTrackedKey);
    article.likes = Math.max(0, article.likes - 1);
    likeBtn.classList.remove('liked');
  } else {
    // Like
    localStorage.setItem(likeKey, 'true');
    localStorage.setItem(likeTrackedKey, 'true');
    article.likes += 1;
    likeBtn.classList.add('liked');
  }
  
  countLabel.innerText = article.likes;
}

function renderArticleComments(article) {
  const commentsContainer = document.getElementById('article-comments-container');
  if (!commentsContainer) return;

  const comments = article.comments || [];

  if (comments.length === 0) {
    commentsContainer.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.9rem; font-style: italic; padding: 12px 0;">
        No comments yet. Share your thoughts on this story!
      </p>
    `;
    return;
  }

  // Render comments descending (newest first)
  commentsContainer.innerHTML = comments.map(c => {
    return `
      <div class="comment-card glass-panel" style="padding: 16px;">
        <img src="${c.authorAvatar}" class="author-avatar" style="width: 36px; height: 36px;" alt="${c.authorName}">
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author-name">${c.authorName}</span>
            <span class="comment-date">${c.date}</span>
          </div>
          <p class="comment-text">${c.text}</p>
          <div class="comment-actions">
            <span onclick="likeComment('${article.id}', '${c.id}', this)"><i class="fa-regular fa-thumbs-up"></i> ${c.likes || 0}</span>
            <span class="delete-comment-btn" onclick="deleteComment('${article.id}', '${c.id}')"><i class="fa-regular fa-trash-can"></i> Delete</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addNewComment(article) {
  const commentTextarea = document.getElementById('comment-input-text');
  if (!commentTextarea) return;

  const textVal = commentTextarea.value.trim();
  if (textVal === '') return;

  // Build comment object
  const newComment = {
    id: 'c-' + Date.now(),
    authorName: 'Guest Publisher',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
    date: 'Just now',
    text: textVal,
    likes: 0
  };

  // Push to local storage comments
  const localCommentsRaw = localStorage.getItem(`globepulse_comments_${article.id}`);
  const localComments = localCommentsRaw ? JSON.parse(localCommentsRaw) : [];
  localComments.push(newComment);
  localStorage.setItem(`globepulse_comments_${article.id}`, JSON.stringify(localComments));

  if (!article.comments) article.comments = [];
  article.comments.push(newComment);

  // Clear Textarea
  commentTextarea.value = '';

  // Re-render
  renderArticleComments(article);

  // Update counter label
  const label = document.getElementById('comments-count-label');
  if (label) label.innerText = article.comments.length;
}

// Global scope functions for comments (must bind to window for inline onclicks)
window.likeComment = function(articleId, commentId, buttonEl) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;

  const comment = article.comments.find(c => c.id === commentId);
  if (!comment) return;

  const localKey = `globepulse_comment_liked_${commentId}`;
  if (localStorage.getItem(localKey)) {
    comment.likes = Math.max(0, (comment.likes || 0) - 1);
    localStorage.removeItem(localKey);
  } else {
    comment.likes = (comment.likes || 0) + 1;
    localStorage.setItem(localKey, 'true');
  }

  // Update comment inside local storage override if present
  const localCommentsRaw = localStorage.getItem(`globepulse_comments_${articleId}`);
  if (localCommentsRaw) {
    const localComments = JSON.parse(localCommentsRaw);
    const localComment = localComments.find(c => c.id === commentId);
    if (localComment) {
      localComment.likes = comment.likes;
      localStorage.setItem(`globepulse_comments_${articleId}`, JSON.stringify(localComments));
    }
  }

  buttonEl.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> ${comment.likes}`;
};

window.deleteComment = function(articleId, commentId) {
  const article = state.articles.find(a => a.id === articleId);
  if (!article) return;

  article.comments = article.comments.filter(c => c.id !== commentId);

  // Remove from local storage comments if present
  const localCommentsRaw = localStorage.getItem(`globepulse_comments_${articleId}`);
  if (localCommentsRaw) {
    let localComments = JSON.parse(localCommentsRaw);
    localComments = localComments.filter(c => c.id !== commentId);
    localStorage.setItem(`globepulse_comments_${articleId}`, JSON.stringify(localComments));
  }

  // Track deletion of static comment if it belongs to default set
  const deletedCommentsKey = `globepulse_deleted_comments_${articleId}`;
  const deletedComments = JSON.parse(localStorage.getItem(deletedCommentsKey) || '[]');
  if (!deletedComments.includes(commentId)) {
    deletedComments.push(commentId);
    localStorage.setItem(deletedCommentsKey, JSON.stringify(deletedComments));
  }

  // Re-render
  renderArticleComments(article);
  const label = document.getElementById('comments-count-label');
  if (label) label.innerText = article.comments.length;
};

// --- DYNAMIC RENDERING: NEWS CREATOR / EDITOR ---
function setupEditorView(editId) {
  const form = document.getElementById('news-editor-form');
  const editIdInput = document.getElementById('edit-article-id');
  const titleInput = document.getElementById('article-input-title');
  const catInput = document.getElementById('article-input-category');
  const timeInput = document.getElementById('article-input-time');
  const summaryInput = document.getElementById('article-input-summary');
  const imageInput = document.getElementById('article-input-image');
  const tagsInput = document.getElementById('article-input-tags');
  const contentInput = document.getElementById('article-input-content');
  
  const pageTitle = document.getElementById('editor-page-title');
  const pageSub = document.getElementById('editor-page-subtitle');
  const submitBtn = document.getElementById('editor-submit-btn');

  if (!form) return;

  // Reset form errors/values
  form.reset();
  editIdInput.value = '';

  // Handle Preset Image click selections
  const presetSelector = document.getElementById('preset-image-selector');
  if (presetSelector) {
    presetSelector.querySelectorAll('.preset-img-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.onclick = (e) => {
        presetSelector.querySelectorAll('.preset-img-option').forEach(o => o.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        imageInput.value = e.currentTarget.getAttribute('data-url');
      };
    });
  }

  if (editId) {
    // Edit existing article mode
    const article = state.articles.find(a => a.id === editId);
    if (article) {
      editIdInput.value = article.id;
      titleInput.value = article.title;
      catInput.value = article.category;
      timeInput.value = article.readTime;
      summaryInput.value = article.summary;
      imageInput.value = article.coverImage;
      tagsInput.value = article.tags.join(', ');
      contentInput.value = article.content;

      pageTitle.innerText = "Edit News Article";
      pageSub.innerText = "Refine the published narrative or correct editorial inaccuracies.";
      submitBtn.querySelector('span').innerText = "Update Story";
      submitBtn.querySelector('i').className = "fa-solid fa-circle-check";

      // Select preset option if it matches URL
      if (presetSelector) {
        const matchingPreset = presetSelector.querySelector(`.preset-img-option[data-url="${article.coverImage}"]`);
        if (matchingPreset) {
          matchingPreset.classList.add('selected');
        }
      }
    }
  } else {
    // Create new article mode
    pageTitle.innerText = "Publish a News Story";
    pageSub.innerText = "Draft and upload global events to the public news feed.";
    submitBtn.querySelector('span').innerText = "Publish Article";
    submitBtn.querySelector('i').className = "fa-solid fa-cloud-arrow-up";

    // Select first preset cover image by default
    if (presetSelector) {
      const firstPreset = presetSelector.querySelector('.preset-img-option');
      if (firstPreset) {
        firstPreset.classList.add('selected');
        imageInput.value = firstPreset.getAttribute('data-url');
      }
    }
  }
}

function handleEditorFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById('edit-article-id').value;
  const title = document.getElementById('article-input-title').value.trim();
  const category = document.getElementById('article-input-category').value;
  const readTime = document.getElementById('article-input-time').value.trim();
  const summary = document.getElementById('article-input-summary').value.trim();
  let coverImage = document.getElementById('article-input-image').value.trim();
  const tagsText = document.getElementById('article-input-tags').value.trim();
  const content = document.getElementById('article-input-content').value.trim();

  if (!coverImage) {
    coverImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"; // Default
  }

  // Parse Tags
  const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(t => t !== '') : [];

  if (editId) {
    // Edit Mode
    const article = state.articles.find(a => a.id === editId);
    if (article) {
      article.title = title;
      article.category = category;
      article.readTime = readTime;
      article.summary = summary;
      article.coverImage = coverImage;
      article.tags = tags;
      article.content = content;
      
      // Update local storage arrays
      let localArticles = [];
      const localArticlesRaw = localStorage.getItem('globepulse_local_articles');
      if (localArticlesRaw) {
        localArticles = JSON.parse(localArticlesRaw);
      }

      // Check if this article was already in the local articles list
      const existingIndex = localArticles.findIndex(a => a.id === editId);
      if (existingIndex > -1) {
        localArticles[existingIndex] = article;
      } else {
        // Overwrite static by saving edited static article locally
        localArticles.unshift(article);
      }
      saveLocalArticlesToStorage(localArticles);

      alert("Story updated successfully!");
      window.location.hash = `#/article/${article.id}`;
    }
  } else {
    // Create Mode
    const newId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
    const newArticle = {
      id: newId,
      title,
      summary,
      category,
      readTime,
      publishedDate: formatDate(new Date()),
      coverImage,
      tags,
      views: 0,
      likes: 0,
      author: {
        name: "Guest Publisher",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        role: "Contributing Editor"
      },
      content,
      comments: []
    };

    // Save to local articles list
    let localArticles = [];
    const localArticlesRaw = localStorage.getItem('globepulse_local_articles');
    if (localArticlesRaw) {
      localArticles = JSON.parse(localArticlesRaw);
    }
    localArticles.unshift(newArticle);
    saveLocalArticlesToStorage(localArticles);

    // Update state
    state.articles.unshift(newArticle);

    alert("News story published successfully to the main feed!");
    window.location.hash = `#/article/${newArticle.id}`;
  }
}

// --- DYNAMIC RENDERING: CREATOR DASHBOARD / STUDIO ---
function renderDashboardView() {
  calculateAndRenderStats();
  renderSVGChart();
  renderDashboardBookmarks();
  renderDashboardManageTable();
}

function calculateAndRenderStats() {
  const articlesCount = state.articles.length;
  const viewsCount = state.articles.reduce((acc, cur) => acc + cur.views, 0);
  const commentsCount = state.articles.reduce((acc, cur) => acc + (cur.comments ? cur.comments.length : 0), 0);
  
  // Calculate average read time
  let totalMinutes = 0;
  state.articles.forEach(a => {
    const mins = parseInt(a.readTime) || 0;
    totalMinutes += mins;
  });
  const avgReadTime = articlesCount > 0 ? Math.round(totalMinutes / articlesCount) : 0;

  // Render Stats numbers in studio overview cards
  document.getElementById('stat-articles-count').innerText = articlesCount;
  document.getElementById('stat-views-count').innerText = formatNumber(viewsCount);
  document.getElementById('stat-read-time').innerText = `${avgReadTime}m`;
  document.getElementById('stat-comments-count').innerText = commentsCount;
}

function renderSVGChart() {
  const chartContainer = document.getElementById('chart-bars-container');
  if (!chartContainer) return;

  // Group views by category
  const categories = ['World', 'Tech', 'Science', 'Culture', 'Business', 'Health'];
  const categoryViews = {};
  categories.forEach(c => categoryViews[c] = 0);

  state.articles.forEach(art => {
    const cat = art.category;
    if (categoryViews[cat] !== undefined) {
      categoryViews[cat] += art.views;
    }
  });

  const maxViews = Math.max(...Object.values(categoryViews), 100); // Prevent divide by zero

  chartContainer.innerHTML = categories.map(cat => {
    const views = categoryViews[cat];
    const percentage = Math.max(8, Math.round((views / maxViews) * 100)); // Minimum height of 8% for visual styling
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar" style="height: ${percentage}%;">
          <div class="chart-tooltip">${cat}: ${formatNumber(views)} views</div>
        </div>
        <div class="chart-label">${cat}</div>
      </div>
    `;
  }).join('');
}

function renderDashboardBookmarks() {
  const container = document.getElementById('bookmarks-container');
  if (!container) return;

  if (state.bookmarks.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 12px 0; text-align: center;">
        No active bookmarks. Select the bookmark tag on card feeds to save readings.
      </p>
    `;
    return;
  }

  const bookmarkedArticles = state.articles.filter(a => state.bookmarks.includes(a.id));

  container.innerHTML = bookmarkedArticles.map(art => {
    return `
      <div class="bookmark-item">
        <span class="bookmark-item-title" onclick="window.location.hash='#/article/${art.id}'">${art.title}</span>
        <i class="fa-solid fa-trash-can remove-bookmark-btn" onclick="removeDashboardBookmark('${art.id}')" title="Remove Bookmark"></i>
      </div>
    `;
  }).join('');
}

window.removeDashboardBookmark = function(articleId) {
  toggleBookmark(articleId);
  renderDashboardBookmarks();
};

function renderDashboardManageTable() {
  const tableBody = document.getElementById('manage-table-body');
  if (!tableBody) return;

  if (state.articles.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">
          No articles published yet. Click "Write Post" to publish.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = state.articles.map(art => {
    return `
      <tr>
        <td>
          <div class="table-article-info">
            <img src="${art.coverImage}" class="table-article-img" alt="${art.title}">
            <span class="table-article-title" onclick="window.location.hash='#/article/${art.id}'">${art.title}</span>
          </div>
        </td>
        <td>
          <span class="table-badge">${art.category}</span>
        </td>
        <td style="color: var(--text-secondary); font-size: 0.85rem;">
          ${art.publishedDate}
        </td>
        <td style="font-weight: 600;">
          ${formatNumber(art.views)}
        </td>
        <td style="font-weight: 600;">
          ${art.likes}
        </td>
        <td>
          <div class="table-actions">
            <!-- Edit -->
            <button class="action-btn-sm edit" onclick="window.location.hash='#/create?edit=${art.id}'" title="Edit Article">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <!-- Delete -->
            <button class="action-btn-sm delete" onclick="deleteArticle('${art.id}')" title="Delete Article">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteArticle = function(articleId) {
  if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
    // 1. Remove from state.articles
    state.articles = state.articles.filter(a => a.id !== articleId);
    
    // 2. Remove from local articles if present
    let localArticles = [];
    const localArticlesRaw = localStorage.getItem('globepulse_local_articles');
    if (localArticlesRaw) {
      localArticles = JSON.parse(localArticlesRaw);
    }
    localArticles = localArticles.filter(a => a.id !== articleId);
    saveLocalArticlesToStorage(localArticles);

    // 3. Track deletion of static article
    const deletedStaticRaw = localStorage.getItem('globepulse_deleted_articles');
    let deletedStatic = deletedStaticRaw ? JSON.parse(deletedStaticRaw) : [];
    if (!deletedStatic.includes(articleId)) {
      deletedStatic.push(articleId);
      localStorage.setItem('globepulse_deleted_articles', JSON.stringify(deletedStatic));
    }
    
    // Remove from bookmarks if bookmarked
    state.bookmarks = state.bookmarks.filter(id => id !== articleId);
    saveBookmarksToStorage();
    
    // Re-render
    renderDashboardView();
  }
};

// --- INTERACTIVE ACTIONS & LOGIC HELPER FUNCTIONS ---

function toggleBookmark(articleId) {
  const index = state.bookmarks.indexOf(articleId);
  let isBookmarked = false;
  if (index > -1) {
    // Remove bookmark
    state.bookmarks.splice(index, 1);
  } else {
    // Add bookmark
    state.bookmarks.push(articleId);
    isBookmarked = true;
  }
  
  saveBookmarksToStorage();
  return isBookmarked;
}

// Global theme switcher toggle
function toggleTheme() {
  if (state.theme === 'dark') {
    state.theme = 'light';
    document.body.classList.add('light-theme');
  } else {
    state.theme = 'dark';
    document.body.classList.remove('light-theme');
  }
  
  localStorage.setItem('globepulse_theme', state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const iconEl = document.getElementById('theme-icon');
  if (!iconEl) return;
  if (state.theme === 'light') {
    iconEl.className = 'fa-solid fa-sun';
  } else {
    iconEl.className = 'fa-solid fa-moon';
  }
}

// Global search execution helper
function executeSearch(query) {
  state.searchQuery = query;
  
  // If we are not in feed view, redirect to feed first to display search result list
  if (window.location.hash !== '#/feed' && window.location.hash !== '') {
    window.location.hash = '#/feed';
  } else {
    renderArticlesGrid();
  }
}

// Format numbers like 14205 to 14.2K
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
}

// Date formatter
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}

// Quick Copy Share
window.copyArticleLink = function() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert("Article reading link copied to clipboard!");
  }).catch(() => {
    alert("Unable to copy link.");
  });
};

window.shareAlert = function(platform) {
  alert(`Mock social share: Open window dialogue to share on ${platform}.`);
};

// --- EVENT BINDINGS ON DOM CONTENT LOADED ---
document.addEventListener('DOMContentLoaded', () => {
  // Init state data
  initStorage();

  // Handle SPA routing
  window.addEventListener('hashchange', handleRouting);
  window.addEventListener('load', handleRouting);
  
  // If no hash triggers, force run router
  if (!window.location.hash) {
    handleRouting();
  }

  // Theme Switcher button binding
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Global search typing
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      executeSearch(e.target.value);
    });
  }

  // News Editor Submit Event
  const editorForm = document.getElementById('news-editor-form');
  if (editorForm) {
    editorForm.addEventListener('submit', handleEditorFormSubmit);
  }

  // Editor Cancel button
  const cancelBtn = document.getElementById('editor-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.hash = '#/dashboard';
    });
  }

  // Logo nav click
  const logo = document.getElementById('nav-logo');
  if (logo) {
    logo.addEventListener('click', () => {
      // Clear filters
      state.activeCategory = 'All';
      state.searchQuery = '';
      const sBox = document.getElementById('global-search');
      if (sBox) sBox.value = '';
    });
  }

  // Newsletter Signup Mock Submit
  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      alert(`Subscription Success! Weekly news digest will be sent to: ${emailInput.value}`);
      emailInput.value = '';
    });
  }
});
