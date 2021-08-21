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

const appendList = (results) => {
    listElm.innerHTML = "";
    results.forEach(x => {
        const li = document.createElement("li");
        li.textContent = x["item"];
        li.dataset.key = x["item"];
        frag.appendChild(li)
    })
    listElm.appendChild(frag);
    resultElm.innerText = `about ${results.length} result matches`
}

const getSearchResult = () => {
    if (!hasCacheResult(searchElm.value.trim())) {
        const items = Search(searchElm.value.trim());
        const results = items.filter(x => x["score"] < 0.50)
        appendList(results);
        cacheSearchResult(searchElm.value.trim(), results);
    }
    const results = cachedResult.find(x => x.key === searchElm.value.trim()).values;
    appendList(results);
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

// const DOMCache = (elm, key) => {
//     const node = elm.childNodes;
//     for (let i = 0; i < node.length; i++) {
//         if (node[i].dataset.key === key) return true;
//     }
// }
