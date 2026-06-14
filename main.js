const SUPABASE_URL = "https://hckhidhozjnzzeivyaqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_5ez4g3fd4YUisouFDfxBmw_B_RvPTFL";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

const popup = document.getElementById("popup");
const addQuoteButton = document.getElementById("addQuoteButton");

let caughtFish = null;
let caughtFishId = null;
let editingFish = null;
let shakeCount = 0;
let lastMouseX = 0;

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

    const fish = createFish(data.id, data.text, data.created_at);
    pond.appendChild(fish);
    startSwimming(fish);

    document.getElementById("addMessage").innerText = "";

    closePopup();
}

function openEditPopup() {
    const quoteText = caughtFish.querySelector(".fishQuote").textContent;

    document.getElementById("editQuoteText").innerText = quoteText;

    editingFish = caughtFish;

    document.getElementById("editPopup").classList.remove("hidden");
}

function closeEditPopup() {
    document.getElementById("editPopup").classList.add("hidden");
}

async function saveEditedQuote() {
    const newQuote = document.getElementById("editQuoteText").innerText;

    editingFish.querySelector(".fishQuote").textContent = newQuote;

    await db.from("quotes").update({ text: newQuote }).eq("id", caughtFishId);

    closeEditPopup();
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
        const fish = createFish(q.id, q.text, q.created_at);
    
        pond.appendChild(fish);
    
        setTimeout(() => {
            startSwimming(fish);
        }, 50);
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
function createFish(id, text, createdAt) {
    const fish = document.createElement("div");
    fish.className = "fish";
    fish.swimming = false;

    fish.innerHTML = `
    <img src="koi.png" class="koi">
    <div class="fishQuote">${text}</div>
    <div class="timestamp">${new Date(createdAt).toLocaleString()}</div>`;

    fish.style.left = Math.random() * 700 + "px";
    fish.style.top = Math.random() * 400 + "px";

    fish.addEventListener("click", (event) => {
        event.stopPropagation();
    
        if (!netEquipped) return;
    
        catchFish(fish, id);
    });

    return fish;
}

function startSwimming(fish) {
    if (fish.swimming) return;

    fish.swimming = true;

    function swim() {
        if (fish.style.display === "none") {
            fish.swimming = false;
            return;
        }

        const currentX = parseFloat(fish.style.left);
        const currentY = parseFloat(fish.style.top);

        const newX = Math.random() * 700;
        const newY = Math.random() * 400;

        const distance = Math.hypot(
            newX - currentX,
            newY - currentY
        );

        const speed = 0.025 + Math.random() * 0.01;
        const swimTime = distance / speed;

        fish.style.transition = `${swimTime}ms linear`;
        fish.style.left = newX + "px";
        fish.style.top = newY + "px";

        setTimeout(swim, swimTime);
    }

    requestAnimationFrame(() => {
        swim();
    });
}

const net = document.getElementById("net");

let netEquipped = false;

const netHolder = document.getElementById("netHolder");

netHolder.addEventListener("click", async (event) => {
    event.stopPropagation();

    if (!netEquipped) {
        netEquipped = true;
        net.style.pointerEvents = "none";
    } else {
        if (caughtFish) {
            await db.from("quotes").delete().eq("id", caughtFishId);
        
            caughtFish.remove();
        
            caughtFish = null;
            caughtFishId = null;
            shakeCount = 0;
        
            net.src = "net.png";
        }
        netEquipped = false;
        returnNetToHolder();
        net.style.pointerEvents = "auto";
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
    caughtFish = fish;
    caughtFishId = id;

    fish.style.display = "none";
    fish.swimming = false;

    net.src = "net_with_fish.png";
}

document.addEventListener("mousemove", async (event) => {
    if (!netEquipped) return;

    net.style.position = "fixed";
    net.style.left = event.clientX - 40 + "px";
    net.style.top = event.clientY - 40 + "px";

    const movement = Math.abs(event.clientX - lastMouseX);

    if (caughtFish && movement > 40) {
        shakeCount++;

        if (shakeCount >= 15) {
            shakeCount = 0;
            openEditPopup();
        }
    }

    lastMouseX = event.clientX;
});

const pond = document.getElementById("pond");

pond.addEventListener("click", () => {
    if (!caughtFish) return;

    const fish = caughtFish;

    fish.style.display = "";

    fish.swimming = false;

    setTimeout(() => {
        startSwimming(fish);
    }, 50);

    net.src = "net.png";

    caughtFish = null;
    caughtFishId = null;
    shakeCount = 0;
});

function returnNetToHolder() {
    net.style.position = "fixed";
    net.style.left = "";
    net.style.top = "";
    net.style.right = "20px";
    net.style.bottom = "20px";
}

// music
const songs = [
    "song1.mp3",
    "song2.mp3",
    "song3.mp3"
];

let currentSong = 0;

const player = document.getElementById("bgMusic");

player.src = songs[currentSong];

player.addEventListener("ended", () => {
    currentSong = (currentSong + 1) % songs.length;
    player.src = songs[currentSong];
    player.play();
});
