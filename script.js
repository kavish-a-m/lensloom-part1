const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const quickPicks = document.getElementById("quick-picks");

async function searchImages(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return;
  }

  results.innerHTML = "";
  emptyState.hidden = true;
  resultCount.textContent = `Finding images for “${trimmedQuery}”...`;

  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=18&gsrsearch=${encodeURIComponent(trimmedQuery)}&prop=imageinfo&iiprop=url&iiurlwidth=560`;
  const response = await fetch(url);

  if (!response.ok) {
    return;
  }

  const data = await response.json();
  const items = Object.values(data.query?.pages || {});

  items.forEach((item) => {
    const imageInfo = item.imageinfo?.[0];

    if (!imageInfo?.thumburl) {
      return;
    }

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

  const renderedCount = results.children.length;
  resultCount.textContent = `Showing ${renderedCount} result${renderedCount === 1 ? "" : "s"} for “${trimmedQuery}”`;
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
