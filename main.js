const popup = document.getElementById("popup");
const addQuoteButton = document.getElementById("addQuoteButton");

addQuoteButton.addEventListener("click", () => {
    popup.classList.remove("hidden");
});

function closePopup() {
    popup.classList.add("hidden")
}

function submitText() {
    const text = document.getElementById("addMessage").innerText;

    const quote = document.createElement("div");
    quote.className = "quote";
    quote.textContent = text;

    document.body.insertBefore(quote, document.getElementById("addQuoteButton"));

    document.getElementById("addMessage").innerText = "";
    closePopup();
}