const searchElm = document.getElementById('search');
const listElm = document.getElementById('SearchList');
const ResultElm = document.querySelector(".searchResult");

let LoadedCountries = [];

const options = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 1,
    threshold: 0.6,
    keys: ["name"]
}

const Search = (pattern) => {
    const fuse = new Fuse(LoadedCountries, options);
    return fuse.search(pattern);
}

const getCountries = async () => {
    return await fetch("https://restcountries.eu/rest/v2/all").then(res => res.json());
}

const appendCountries = (countries) => {
    countries.forEach(x => LoadedCountries.push(x["name"]));
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
    ResultElm.innerText = `About (${results.length})  Result matches`
}

const getSearchResult = () => {
    const results = Search(searchElm.value);
    const items = results.filter(x => x["score"] < 0.50)
    appendList(items);

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
