const SUPABASE_URL = "https://hckhidhozjnzzeivyaqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_5ez4g3fd4YUisouFDfxBmw_B_RvPTFL";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

const popup = document.getElementById("popup");
const addQuoteButton = document.getElementById("addQuoteButton");

if (popup && addQuoteButton) {
    addQuoteButton.addEventListener("click", () => {
        popup.classList.remove("hidden");
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            closePopup();
        }
    });
}

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

    const pond = document.getElementById("pond");

    if (pond) {
        pond.appendChild(createFish(data.id, data.text));
}

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
    const pond = document.getElementById("pond");

    if (!pond) return;

    const { data, error } = await db.from("quotes").select("*").order("created_at");

    if (error) {
        console.log(error);
        return;
    }

    data.forEach(q => {
        pond.appendChild(createFish(q.id, q.text));
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

// writing.html JS
async function addJournal() {
    const text = document.getElementById("journalText").innerText;

    const { data, error } = await db.from("journals").insert([{ text }]).select().single();

    if (error) {
        console.error(error);
        return;
    }

    const journal = createJournalElement(data.id,data.text);

    document.getElementById("journals").prepend(journal);
    document.getElementById("journalText").innerText = "";
}

async function loadJournals() {
    const journalsContainer = document.getElementById("journals");

    if (!journalsContainer) return;

    const { data } = await db.from("journals").select("*").order("created_at", { ascending: false });

    data.forEach(journal => {
        const div = createJournalElement(journal.id, journal.text);
        journalsContainer.appendChild(div);
    });
}

function createJournalElement(id, text) {
    const journal = document.createElement("div");
    journal.className = "journal";

    const textDiv = document.createElement("div");
    textDiv.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "deleteButton";

    deleteButton.addEventListener("click", () => {
        deleteJournal(id, journal);
    });

    journal.appendChild(textDiv);
    journal.appendChild(deleteButton);

    return journal;
}

async function deleteJournal(id, journalElement) {
    const { error } = await db.from("journals").delete().eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    journalElement.remove();
}

loadJournals();

// fish
function createFish(id, text) {
    const fish = document.createElement("div");
    fish.className = "fish";

    fish.innerHTML = `<img src="koi.png" class="koi"><div class="fishQuote">${text}</div>`;

    fish.style.left = Math.random() * 700 + "px";
    fish.style.top = Math.random() * 400 + "px";

    fish.addEventListener("click", () => {
        if (!netEquipped) return;
    
        catchFish(fish, id);
    });

    startSwimming(fish);

    return fish;
}

function startSwimming(fish) {
    setInterval(() => {
        const newX = Math.random() * 700;
        const newY = Math.random() * 400;

        fish.style.transition = "5s linear";
        fish.style.left = newX + "px";
        fish.style.top = newY + "px";
    }, 3000 + Math.random() * 4000);
}

const net = document.getElementById("net");

let netEquipped = false;

const netHolder = document.getElementById("net");

netHolder.addEventListener("click", () => {
    netEquipped = !netEquipped;

    if (!netEquipped) {
        net.style.left = "";
        net.style.top = "";
        net.style.right = "20px";
        net.style.bottom = "20px";
    }
});

document.addEventListener("mousemove", (event) => {
    if (!netEquipped) return;

    net.style.position = "fixed";

    net.style.left = event.clientX - 40 + "px";
    net.style.top = event.clientY - 40 + "px";

    net.style.right = "";
    net.style.bottom = "";
});

async function catchFish(fish, id) {
    await db.from("quotes").delete().eq("id", id);

    fish.remove();

    net.src = "net_with_fish.png";

    setTimeout(() => {
        net.src = "net.png";
    }, 2000);
}
