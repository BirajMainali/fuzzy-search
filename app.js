const searchElm = document.getElementById('search');
const listElm = document.getElementById('SearchList');
const resultElm = document.querySelector(".searchResult");

let loadedCountries = [];

const options = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 1,
    includeMatches: true,
    ignoreLocation: false,
    threshold: 0.6,
    keys: ["name"]
}

const Search = (pattern) => {
    const fuse = new Fuse(loadedCountries, options);
    return fuse.search(pattern);
}

const getCountries = async () => {
    return await fetch("https://restcountries.eu/rest/v2/all").then(res => res.json());
}

const appendCountries = (countries) => {
    countries.forEach(x => loadedCountries.push(x["name"]));
}
const loadCountries = async () => {
    const res = await getCountries();
    appendCountries(res);
}

const appendList = (results) => {
    listElm.innerHTML = "";
    results.forEach(x => {
        const li = document.createElement("li");
        li.textContent = x["item"];
        listElm.appendChild(li);
    })
    resultElm.innerText = `about ${results.length} result matches`
}

const getSearchResult = () => {
    const items = Search(searchElm.value.trim());
    const results = items.filter(x => x["score"] < 0.50)
    appendList(results);
}

const debounce = (func, delay) => {
    let timer;
    return function () {
        let context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    }
}

const processData = debounce(getSearchResult, 500);

window.addEventListener("DOMContentLoaded", async () => {
    await loadCountries();
})
