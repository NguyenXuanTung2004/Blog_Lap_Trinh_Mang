// @ts-check

class Search {
    constructor() {
        this.searchForm = document.querySelector(".search-form");
        this.searchInput = document.querySelector(".search-input");
        this.searchResult = document.querySelector(".search-result");
        this.searchResultTitle = document.querySelector(".search-result--title");
        this.searchResultList = document.querySelector(".search-result--list");
        this.data = [];
        
        this.init();
    }

    async init() {
        const response = await fetch(this.searchForm.dataset.json);
        if (!response.ok) {
            console.error("Failed to fetch search data");
            return;
        }
        this.data = await response.json();
        
        this.searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.onSubmit();
        });

        this.searchInput.addEventListener("input", () => {
            if (!this.searchInput.value) {
                this.hideResults();
            }
        });
    }

    hideResults() {
        this.searchResult.style.display = "none";
        this.searchResultTitle.textContent = "";
        this.searchResultList.innerHTML = "";
    }

    showResults() {
        this.searchResult.style.display = "block";
    }

    displayResults(results, searchTerm) {
        if (results.length === 0) {
            this.searchResultTitle.textContent = `No results found for "${searchTerm}"`;
            this.searchResultList.innerHTML = "";
        } else {
            this.searchResultTitle.textContent = `Found ${results.length} results for "${searchTerm}"`;
            this.searchResultList.innerHTML = results.map(item => `
                <article class="search-result--item">
                    <h2><a href="${item.permalink}">${item.title}</a></h2>
                    <div class="search-result--content">
                        ${item.summary || item.content.substring(0, 200)}...
                    </div>
                    <div class="search-result--metadata">
                        ${item.categories ? `
                            <div class="categories">
                                ${item.categories.map(cat => `<span class="category">${cat}</span>`).join(" ")}
                            </div>
                        ` : ''}
                        ${item.tags ? `
                            <div class="tags">
                                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}
                            </div>
                        ` : ''}
                    </div>
                </article>
            `).join("");
        }
        this.showResults();
    }

    onSubmit() {
        const searchTerm = this.searchInput.value.toLowerCase();
        if (!searchTerm) {
            this.hideResults();
            return;
        }

        const results = this.data.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(searchTerm);
            const contentMatch = item.content.toLowerCase().includes(searchTerm);
            const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
            const categoriesMatch = item.categories?.some(category => category.toLowerCase().includes(searchTerm));
            return titleMatch || contentMatch || tagsMatch || categoriesMatch;
        });

        this.displayResults(results, searchTerm);

        const results = this.data.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const contentMatch = post.content.toLowerCase().includes(searchTerm);
            const categoryMatch = post.categories?.some(cat => cat.toLowerCase().includes(searchTerm)) || false;
            const tagMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;
            return titleMatch || contentMatch || categoryMatch || tagMatch;
        });

        this.renderResults(results, searchTerm);
    }

    renderResults(results, searchTerm) {
        this.searchResultTitle.textContent = `Found ${results.length} results for "${searchTerm}"`;
        this.searchResultList.innerHTML = results.map(post => `
            <article class="article">
                <h2 class="article-title">
                    <a href="${post.permalink}">${post.title}</a>
                </h2>
                <div class="article-excerpt">
                    ${post.summary || post.content.substring(0, 200)}...
                </div>
                <footer class="article-meta">
                    <time>${post.date}</time>
                    ${post.categories?.map(cat => `<span class="category">${cat}</span>`).join(" ") || ""}
                    ${post.tags?.map(tag => `<span class="tag">${tag}</span>`).join(" ") || ""}
                </footer>
            </article>
        `).join("");
        this.showResults();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Search();
});