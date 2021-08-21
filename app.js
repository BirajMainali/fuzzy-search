const searchElm = document.getElementById('search');
const listElm = document.getElementById('SearchList');
const resultElm = document.querySelector(".searchResult");
const frag = new DocumentFragment()

const [loadedCountries, cachedResult] = [[], []]

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

const renderList = (countries) => {
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

const getSearchResult = () => {
    if (!hasCacheResult(searchElm.value.trim())) {
        const items = Search(searchElm.value.trim());
        const results = items.filter(x => x["score"] < 0.50)
        const countries = results.map(x => x.item);
        renderList(countries);
        cacheSearchResult(searchElm.value.trim(), results);
    } else if (searchElm.value !== "") {
        const results = cachedResult.find(x => x.key === searchElm.value.trim()).values;
        const countries = results.map(x => x.item);
        renderList(countries);
    }
}


const cacheSearchResult = (key, results) => {
    if (key !== "") {
        if (hasCacheResult(key)) return -1;
        cachedResult.push({
            key: key,
            values: results
        })
    }
}

const hasCacheResult = (key) => cachedResult.some(x => x.key === key);

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
    searchElm.value = "";
    await loadCountries();
})
