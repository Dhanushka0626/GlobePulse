/**
 * GlobePulse Firebase Database Interface
 * Wraps Firebase Firestore operations with a graceful local fallback.
 */

function isFirebaseConfigured() {
  return typeof firebase !== 'undefined' && 
         typeof firebaseConfig !== 'undefined' && 
         firebaseConfig.projectId && 
         !firebaseConfig.projectId.startsWith("YOUR_");
}

let db = null;
let isFirebaseActive = false;

if (isFirebaseConfigured()) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseActive = true;
    console.log("GlobePulse: Firebase initialized successfully.");
  } catch (error) {
    console.error("GlobePulse: Error initializing Firebase:", error);
  }
} else {
  console.warn("GlobePulse: Firebase is not configured. Falling back to local storage and static data.");
}

/**
 * Fetch all articles from Firestore, ordered by createdAt descending.
 * If empty, automatically seeds Firestore with the DEFAULT_ARTICLES array.
 */
async function dbGetArticles() {
  if (!isFirebaseActive) return null;
  try {
    const snapshot = await db.collection('articles').orderBy('createdAt', 'desc').get();
    let list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    
    // Auto-seed: If collection is empty, populate with DEFAULT_ARTICLES
    if (list.length === 0 && typeof DEFAULT_ARTICLES !== 'undefined' && DEFAULT_ARTICLES.length > 0) {
      console.log("GlobePulse: Firestore 'articles' collection is empty. Seeding with default articles...");
      for (let i = DEFAULT_ARTICLES.length - 1; i >= 0; i--) {
        const art = DEFAULT_ARTICLES[i];
        // Create a Firestore Timestamp offset to preserve order
        const timeOffset = (DEFAULT_ARTICLES.length - i) * 60000;
        const createdAt = firebase.firestore.Timestamp.fromDate(new Date(Date.now() - timeOffset));
        
        const artWithTimestamp = {
          ...art,
          createdAt: createdAt
        };
        await db.collection('articles').doc(art.id).set(artWithTimestamp);
      }
      
      // Re-fetch sorted results
      const newSnapshot = await db.collection('articles').orderBy('createdAt', 'desc').get();
      list = [];
      newSnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
    }
    
    return list;
  } catch (err) {
    console.error("GlobePulse: Error fetching articles from Firestore:", err);
    return null;
  }
}

/**
 * Save a new article to Firestore.
 */
async function dbAddArticle(article) {
  if (!isFirebaseActive) return false;
  try {
    const docRef = db.collection('articles').doc(article.id);
    await docRef.set({
      ...article,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error("GlobePulse: Error adding article to Firestore:", err);
    return false;
  }
}

/**
 * Update existing article fields in Firestore.
 */
async function dbUpdateArticle(articleId, updatedFields) {
  if (!isFirebaseActive) return false;
  try {
    await db.collection('articles').doc(articleId).update(updatedFields);
    return true;
  } catch (err) {
    console.error("GlobePulse: Error updating article in Firestore:", err);
    return false;
  }
}

/**
 * Delete an article from Firestore.
 */
async function dbDeleteArticle(articleId) {
  if (!isFirebaseActive) return false;
  try {
    await db.collection('articles').doc(articleId).delete();
    return true;
  } catch (err) {
    console.error("GlobePulse: Error deleting article from Firestore:", err);
    return false;
  }
}

/**
 * Increment the view count for an article in Firestore.
 */
async function dbIncrementViews(articleId) {
  if (!isFirebaseActive) return false;
  try {
    await db.collection('articles').doc(articleId).update({
      views: firebase.firestore.FieldValue.increment(1)
    });
    return true;
  } catch (err) {
    console.error("GlobePulse: Error incrementing views in Firestore:", err);
    return false;
  }
}

/**
 * Increment or decrement the likes count for an article in Firestore.
 */
async function dbIncrementLikes(articleId, incrementValue) {
  if (!isFirebaseActive) return false;
  try {
    await db.collection('articles').doc(articleId).update({
      likes: firebase.firestore.FieldValue.increment(incrementValue)
    });
    return true;
  } catch (err) {
    console.error("GlobePulse: Error updating likes in Firestore:", err);
    return false;
  }
}

/**
 * Update the comments array for an article in Firestore.
 * Used for both adding, deleting, and liking comments.
 */
async function dbUpdateComments(articleId, commentsList) {
  if (!isFirebaseActive) return false;
  try {
    await db.collection('articles').doc(articleId).update({
      comments: commentsList
    });
    return true;
  } catch (err) {
    console.error("GlobePulse: Error updating comments in Firestore:", err);
    return false;
  }
}
