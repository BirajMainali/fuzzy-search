const __ = document.querySelector.bind(document);
const __a = document.querySelectorAll.bind(document);

const searchElm = __('#search')
const listElm = __('#SearchList');
const resultElm = __('.searchResult');
const frag = new DocumentFragment()

let [LoadedCountries, Cache, SearchString] = [[], [], ""]

const options = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 1,
    distance: 100,
    findAllMatches: true,
    includeMatches: true,
    ignoreLocation: true,
    keys: ["name"]
}

const getCountries = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all').then(response => response.json());
    response.forEach(x => LoadedCountries.push(x.name["common"]));
}

const Search = (pattern) => {
    const fuse = new Fuse(LoadedCountries, options);
    return fuse.search(pattern);
}

const getSearchResult = () => {
    let countries;
    if (!hasCached(SearchString)) {
        const items = Search(SearchString);
        const results = items.filter(x => x["score"] < 0.50)
        countries = mapCountries(results);
        renderCacheList(countries);
        cacheResult(SearchString, results);
    } else if (SearchString !== "") {
        const results = getCache();
        countries = mapCountries(results);
        renderCacheList(countries);
    }
}

const mapCountries = (results) => results.map(x => x.item);

const getCache = () => Cache.find(c => c.key === SearchString).values;

const hasCached = (key) => Cache.some(x => x.key === key);

const cacheResult = (key, results) => {
    if (key !== "") {
        if (hasCached(key)) return -1;
        Cache.push({
            key: key,
            values: results
        })
    }
}

const renderCacheList = (countries) => {
    const childNodes = Array.from(listElm.childNodes);
    const added = [];
    const version = Math.random() * 100;
    for (let i = 0; i < childNodes.length; i++) {
        const key = childNodes[i].dataset.key;
        if (!countries.some(x => x === key)) {
            childNodes[i].remove();
        } else {
            added.push(key);
        }
    }
    countries.forEach(x => {
        if (!added.some(y => y === x)) {
            const li = document.createElement("li");
            li.textContent = x;
            li.dataset.key = x;
            li.dataset.version = version;
            frag.appendChild(li);
        }
    });
    listElm.appendChild(frag);
    resultElm.textContent = `about ${countries.length} result matches`
}

const Debounce = (func, delay) => {
    let TIMER;
    return function () {
        let context = this,
            args = arguments;
        clearTimeout(TIMER);
        TIMER = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    }
}

const processData = Debounce(getSearchResult, 500);

searchElm.onkeyup = e => {
    SearchString = e.target.value.trim();
    processData();
}

window.addEventListener("DOMContentLoaded", async () => {
    await getCountries();
})
