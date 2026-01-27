// Bookmark utilities for localStorage
const BOOKMARKS_KEY = 'car_showroom_bookmarks';

export interface Bookmarks {
  posts: string[];
  cars: string[];
}

export const getBookmarks = (): Bookmarks => {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading bookmarks:', e);
  }
  return { posts: [], cars: [] };
};

export const saveBookmarks = (bookmarks: Bookmarks) => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Error saving bookmarks:', e);
  }
};

export const isPostBookmarked = (postId: string): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.posts.includes(postId);
};

export const isCarBookmarked = (carId: string): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.cars.includes(carId);
};

export const togglePostBookmark = (postId: string): boolean => {
  const bookmarks = getBookmarks();
  const index = bookmarks.posts.indexOf(postId);

  if (index === -1) {
    bookmarks.posts.push(postId);
  } else {
    bookmarks.posts.splice(index, 1);
  }

  saveBookmarks(bookmarks);
  return index === -1; // returns true if now bookmarked
};

export const toggleCarBookmark = (carId: string): boolean => {
  const bookmarks = getBookmarks();
  const index = bookmarks.cars.indexOf(carId);

  if (index === -1) {
    bookmarks.cars.push(carId);
  } else {
    bookmarks.cars.splice(index, 1);
  }

  saveBookmarks(bookmarks);
  return index === -1; // returns true if now bookmarked
};
