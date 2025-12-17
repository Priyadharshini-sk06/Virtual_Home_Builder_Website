function showDetails(name, beds, baths, price, img) {
    document.getElementById("houseName").innerText = name;
    document.getElementById("roomInfo").innerText = beds + " | " + baths;
    document.getElementById("housePrice").innerText = price;
    document.getElementById("houseImg").src = img;

    document.getElementById("detailsPanel").classList.add("open");
}

function closePanel() {
    document.getElementById("detailsPanel").classList.remove("open");
}
