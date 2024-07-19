const content = document.querySelector(".content");
    const inputSearch = document.querySelector("input[type='search']");

    const items = <%- JSON.stringify(selectAll) %>;

    inputSearch.oninput = () => {
        content.innerHTML = "";
        const query = inputSearch.value.toLowerCase();
        
        const filteredItems = items.filter(item => item.title.toLowerCase().includes(query) || item.atriz.toLowerCase().includes(query) || item.studio.toLowerCase().includes(query));

        filteredItems.forEach(item => addHTML(item));
    };

    function addHTML(item) {
        const card = document.createElement("div");
        card.classList.add("card");

        const cardImg = document.createElement("div");
        cardImg.classList.add("card-img");
        cardImg.innerHTML = `<a href="/watch/${item.id}"><img class="img-thumb" src="${item.cover}.jpg" alt="${item.title}"></a>`;

        const cardText = document.createElement("div");
        cardText.classList.add("card-text");
        cardText.innerHTML = `<a href="/watch/${item.id}"><h4>${item.title.length > 20 ? item.title.substring(0, 42) + '...' : item.title}</h4></a><li><i class="fas fa-star"></i> Atriz: ${item.atriz}</li>`;

        const rectangle = document.createElement("div");
        rectangle.classList.add("rectangle");
        rectangle.innerHTML = `<h5>${item.studio}</h5>`;

        card.append(cardImg, cardText, rectangle);
        content.append(card);
    }