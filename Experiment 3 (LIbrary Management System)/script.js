const apiUrl = "http://localhost:3001/books";

const bookForm = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const bookList = document.getElementById("bookList");

let editingBookId = null;
let allBooks = [];

// Fetch
async function fetchBooks() {
  const res = await fetch(apiUrl);
  allBooks = await res.json();
  displayBooks(allBooks);
}

// Render
function displayBooks(books) {
  const searchTerm = searchInput.value.toLowerCase();
  bookList.innerHTML = "";

  books
    .filter(book => book.title.toLowerCase().includes(searchTerm))
    .forEach(book => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${book.title}</strong> — ${book.author}
        </div>
        <div class="actions">
          <button class="tonal edit">✏️ Edit</button>
          <button class="delete">🗑️ Delete</button>
        </div>
      `;

      // Edit
      li.querySelector(".edit").addEventListener("click", () => {
        editingBookId = book.id;
        titleInput.value = book.title;
        authorInput.value = book.author;
        submitBtn.textContent = "✏️ Update Book";
      });

      // Delete
      li.querySelector(".delete").addEventListener("click", async () => {
        if (confirm(`Delete "${book.title}"?`)) {
          await fetch(`${apiUrl}/${book.id}`, { method: "DELETE" });
          fetchBooks();
        }
      });

      bookList.appendChild(li);
    });
}

// Add / Update
bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newBook = {
    title: titleInput.value,
    author: authorInput.value,
  };

  if (editingBookId) {
    await fetch(`${apiUrl}/${editingBookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook),
    });
    editingBookId = null;
    submitBtn.textContent = "➕ Add Book";
  } else {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook),
    });
  }

  titleInput.value = "";
  authorInput.value = "";
  fetchBooks();
});

// Search
searchBtn.addEventListener("click", () => displayBooks(allBooks));
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    displayBooks(allBooks);
  }
});

// Init
fetchBooks();
