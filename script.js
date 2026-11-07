const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const quickPicks = document.getElementById("quick-picks");
const searchStatus = document.getElementById("search-status");

function showStatus(message, state) {
  searchStatus.textContent = message;
  searchStatus.dataset.state = state;
  searchStatus.hidden = false;
}

function hideStatus() {
  searchStatus.hidden = true;
  searchStatus.textContent = "";
}

async function searchImages(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return;
  }

  results.innerHTML = "";
  emptyState.hidden = true;
  showStatus(`Searching Wikimedia Commons for “${trimmedQuery}”...`, "loading");
  resultCount.textContent = `Finding images for “${trimmedQuery}”...`;

  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=18&gsrsearch=${encodeURIComponent(trimmedQuery)}&prop=imageinfo&iiprop=url&iiurlwidth=560`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Image request failed");
    }

    const data = await response.json();
    const items = Object.values(data.query?.pages || {});
    const imageItems = items.filter((item) => item.imageinfo?.[0]?.thumburl);

    if (imageItems.length === 0) {
      showStatus(`No image results for “${trimmedQuery}”. Try another search.`, "empty");
      resultCount.textContent = `No results for “${trimmedQuery}”`;
      return;
    }

    imageItems.forEach((item) => {
      const imageInfo = item.imageinfo[0];

      const card = document.createElement("article");
      const link = document.createElement("a");
      const image = document.createElement("img");
      const caption = document.createElement("p");

      card.className = "result-card";
      link.className = "result-link";
      link.href = imageInfo.descriptionurl || imageInfo.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      image.src = imageInfo.thumburl;
      image.alt = item.title.replace(/^File:/, "");
      image.loading = "lazy";
      caption.textContent = item.title.replace(/^File:/, "");

      link.appendChild(image);
      card.appendChild(link);
      card.appendChild(caption);
      results.appendChild(card);
    });

    hideStatus();
    const renderedCount = results.children.length;
    resultCount.textContent = `Showing ${renderedCount} result${renderedCount === 1 ? "" : "s"} for “${trimmedQuery}”`;
  } catch (error) {
    results.innerHTML = "";
    showStatus("Something went wrong. Please try again.", "error");
    resultCount.textContent = "Search unavailable — please try again";
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value;
  await searchImages(query);
});

quickPicks.addEventListener("click", async (event) => {
  const chip = event.target.closest(".chip");

  if (!chip) {
    return;
  }

  searchInput.value = chip.textContent;
  await searchImages(searchInput.value);
});
