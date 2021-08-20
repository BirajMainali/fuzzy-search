const searchElm = document.getElementById('search');
const listElm = document.getElementById('SearchList');
const resultElm = document.querySelector(".searchResult");
const frag = new DocumentFragment()

const [loadedCountries, searchedCountries] = [[], []]

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

const recordSearchResult = (key, results) => {
    if (key !== "") {
        if (hasRecordedResult(key)) return;
        searchedCountries.push({
            key: key,
            values: results
        })
    }
}
const hasRecordedResult = (key) => searchedCountries.some(x => x.key === key);

const appendList = (results) => {
    listElm.innerHTML = "";
    results.forEach(x => {
        const li = document.createElement("li");
        li.textContent = x["item"];
        // li.dataset.key = x["item"];
        frag.appendChild(li)

    })
    resultElm.innerText = `about ${results.length} result matches`
    listElm.appendChild(frag);
}

const getSearchResult = () => {
    if (!hasRecordedResult(searchElm.value.trim())) {
        const items = Search(searchElm.value.trim());
        const results = items.filter(x => x["score"] < 0.50)
        appendList(results);
        recordSearchResult(searchElm.value.trim(), results);
    }
    const results = searchedCountries.find(x => x.key === searchElm.value.trim()).values;
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
