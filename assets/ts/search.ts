import { search } from "./search";

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.querySelector(".search-input");
  const searchResult = document.querySelector(".search-result");
  const searchResultTitle = document.querySelector(".search-result--title");
  const searchResultList = document.querySelector(".search-result--list");

  if (searchForm) {
    const jsonUrl = searchForm.dataset.json;
    let searchData = null;

    // Fetch search data
    fetch(jsonUrl)
      .then(response => response.json())
      .then(data => {
        searchData = data.data.posts;
      })
      .catch(error => {
        console.error("Error fetching search data:", error);
      });

    // Handle search
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!searchData) return;

      const searchTerm = searchInput.value.toLowerCase();
      if (!searchTerm) {
        hideResults();
        return;
      }

      const results = searchData.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchTerm);
        const contentMatch = post.content.toLowerCase().includes(searchTerm);
        const categoryMatch = post.categories?.some(cat => 
          cat.toLowerCase().includes(searchTerm)
        );
        const tagMatch = post.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
        return titleMatch || contentMatch || categoryMatch || tagMatch;
      });

      displayResults(results, searchTerm);
    });

    // Clear results when input is cleared
    searchInput.addEventListener("input", () => {
      if (!searchInput.value) {
        hideResults();
      }
    });

    function hideResults() {
      searchResult.style.display = "none";
      searchResultTitle.textContent = "";
      searchResultList.innerHTML = "";
    }

    function displayResults(results, searchTerm) {
      searchResultTitle.textContent = `Found ${results.length} results for "${searchTerm}"`;
      
      searchResultList.innerHTML = results.map(post => `
        <article class="article">
          <h2 class="article-title">
            <a href="${post.permalink}">${post.title}</a>
          </h2>
          <div class="article-excerpt">
            ${post.summary || post.content.substring(0, 200)}...
          </div>
          <footer class="article-meta">
            <time>${post.date}</time>
            ${post.categories?.map(cat => 
              `<span class="category">${cat}</span>`
            ).join("") || ""}
            ${post.tags?.map(tag => 
              `<span class="tag">${tag}</span>`
            ).join("") || ""}
          </footer>
        </article>
      `).join("");

      searchResult.style.display = "block";
    }
  }
});