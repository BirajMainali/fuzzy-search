const searchElm = document.getElementById('search');
const listElm = document.getElementById('SearchList');
const resultElm = document.querySelector(".searchResult");
const frag = new DocumentFragment()

let [loadedCountries, Cache, searchString] = [[], [], ""]

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

const Search = (pattern) => {
    const fuse = new Fuse(loadedCountries, options);
    return fuse.search(pattern);
}

const GETCountries = async () => {
    return await fetch("https://restcountries.eu/rest/v2/all").then(res => res.json());
}

const appendCountries = (countries) => {
    countries.forEach(x => loadedCountries.push(x["name"]));
}
const loadCountries = async () => {
    const res = await GETCountries();
    appendCountries(res);
}


const GETSearchResult = () => {
    let countries;
    if (!hasCached(searchString)) {
        const items = Search(searchString);
        const results = items.filter(x => x["score"] < 0.50)
        countries = MapCountries(results);
        RenderCacheList(countries);
        CacheResult(searchString, results);
    } else if (searchString !== "") {
        const results = GETCache();
        countries = MapCountries(results);
        RenderCacheList(countries);
    }
}

const MapCountries = (results) => results.map(x => x.item);

const GETCache = () => Cache.find(c => c.key === searchString).values;

const hasCached = (key) => Cache.some(x => x.key === key);

const CacheResult = (key, results) => {
    if (key !== "") {
        if (hasCached(key)) return -1;
        Cache.push({
            key: key,
            values: results
        })
    }
}

const RenderCacheList = (countries) => {
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

const processData = debounce(GETSearchResult, 500);

searchElm.onkeyup = e => {
    searchString = e.target.value.trim();
    processData();
}

window.addEventListener("DOMContentLoaded", async () => {
    await loadCountries();
})
