const SUPABASE_URL = "https://rfohexlqbyiyjvbocqgm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmb2hleGxxYnlpeWp2Ym9jcWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjgzNjcsImV4cCI6MjA5NjUwNDM2N30.8ytC3woHL_J7TJ_X4yOrIrpMw3aviw3er8SWNM2jBao";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const popup = document.getElementById("popup");
const addQuoteButton = document.getElementById("addQuoteButton");

addQuoteButton.addEventListener("click", () => {
    popup.classList.remove("hidden");
});

popup.addEventListener("click", (event) => {
    if (event.target === popup) {
        closePopup();
    }
});

function closePopup() {
    popup.classList.add("hidden")
}

async function submitText() {
    const text = document.getElementById("addMessage").innerText;

    const {data, error} = await db.from("quotes").insert([{text: text}]).select().single();

    if (error) {
        console.error(error);
        return;
    }

    const quote = createQuoteElement(data.id, data.text);

    document.body.insertBefore(quote, document.getElementById("addQuoteButton"));

    document.getElementById("addMessage").innerText = "";

    closePopup();
}

function createQuoteElement(id, text) {
    const quote = document.createElement("div");
    quote.className = "quote";

    const textDiv = document.createElement("div");
    textDiv.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "deleteButton";

    deleteButton.addEventListener("click", () => {
        deleteQuote(id, quote);
    });

    quote.appendChild(textDiv);
    quote.appendChild(deleteButton);

    return quote;
}

async function loadQuotes() {
    const {data, error} = await db.from("quotes").select("*").order("created_at");

    if (error) {
        console.log(error);
        return;
    }

    data.forEach(q => {
        const quote = createQuoteElement(q.id, q.text);

        document.body.insertBefore(quote, document.getElementById("addQuoteButton"));
    });
}

loadQuotes();

async function deleteQuote(id, quoteElement) {
    const {error} = await db.from("quotes").delete().eq("id", id)

    if (error) {
        console.error(error);
        return;
    }

    quoteElement.remove();
}
