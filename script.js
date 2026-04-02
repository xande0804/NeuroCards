const flashcardEl = document.getElementById("flashcard");
const flashcardSliderEl = document.getElementById("flashcardSlider");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const counterEl = document.getElementById("counter");
const toggleBtn = document.getElementById("toggleBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const statusMessageEl = document.getElementById("statusMessage");

const SLIDE_DURATION = 280;

let originalFlashcards = [];
let flashcards = [];
let currentIndex = 0;
let isFlipped = false;
let isAnimating = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateFlipState(flipped) {
  isFlipped = flipped;
  flashcardEl.classList.toggle("is-flipped", isFlipped);
  toggleBtn.textContent = isFlipped ? "Ver pergunta" : "Ver resposta";
  toggleBtn.setAttribute("aria-pressed", String(isFlipped));
}

function renderCard() {
  if (!flashcards.length) {
    questionEl.textContent = "Nenhum flashcard encontrado.";
    answerEl.textContent = "Adicione cards no arquivo cards.json.";
    counterEl.textContent = "0 / 0";
    toggleBtn.disabled = true;
    shuffleBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const currentCard = flashcards[currentIndex];

  questionEl.innerHTML = currentCard.question;
  answerEl.innerHTML = currentCard.answer;
  counterEl.textContent = `${currentIndex + 1} / ${flashcards.length}`;
}

function setButtonsDisabled(disabled) {
  toggleBtn.disabled = disabled;
  shuffleBtn.disabled = disabled;
  prevBtn.disabled = disabled;
  nextBtn.disabled = disabled;
}

function clearSlideClasses() {
  flashcardSliderEl.classList.remove(
    "is-sliding-out-left",
    "is-sliding-out-right",
    "is-pre-enter-left",
    "is-pre-enter-right",
    "is-entering"
  );
}

function flipCard() {
  if (!flashcards.length || isAnimating) return;
  updateFlipState(!isFlipped);
}

function shuffleArray(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function shuffleCards() {
  if (!flashcards.length || isAnimating) return;

  flashcards = shuffleArray(originalFlashcards);
  currentIndex = 0;
  renderCard();
  updateFlipState(false);
}

async function navigate(direction) {
  if (!flashcards.length || isAnimating) return;

  isAnimating = true;
  setButtonsDisabled(true);

  const isNext = direction === "next";
  const outClass = isNext ? "is-sliding-out-left" : "is-sliding-out-right";
  const preEnterClass = isNext ? "is-pre-enter-right" : "is-pre-enter-left";

  clearSlideClasses();
  flashcardSliderEl.classList.add(outClass);

  await wait(SLIDE_DURATION);

  clearSlideClasses();

  currentIndex = isNext
    ? (currentIndex + 1) % flashcards.length
    : (currentIndex - 1 + flashcards.length) % flashcards.length;

  updateFlipState(false);
  renderCard();

  flashcardSliderEl.classList.add(preEnterClass);

  await wait(20);

  flashcardSliderEl.classList.add("is-entering");
  flashcardSliderEl.classList.remove(preEnterClass);

  await wait(SLIDE_DURATION);

  clearSlideClasses();
  setButtonsDisabled(false);
  isAnimating = false;
}

function goNext() {
  navigate("next");
}

function goPrev() {
  navigate("prev");
}

async function loadCards() {
  try {
    const response = await fetch("./cards.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("cards.json não contém um array válido.");
    }

    originalFlashcards = data.filter(
      (item) =>
        item &&
        typeof item.question === "string" &&
        typeof item.answer === "string"
    );

    if (!originalFlashcards.length) {
      throw new Error("Nenhum card válido foi encontrado em cards.json.");
    }

    flashcards = [...originalFlashcards];

    renderCard();
    updateFlipState(false);
    toggleBtn.disabled = false;
    shuffleBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  } catch (error) {
    console.error(error);
    statusMessageEl.textContent =
      "Erro ao carregar os flashcards. Verifique o cards.json.";
    questionEl.textContent = "Erro ao carregar deck.";
    answerEl.textContent = "Confira o arquivo cards.json.";
    counterEl.textContent = "0 / 0";
    toggleBtn.disabled = true;
    shuffleBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

toggleBtn.addEventListener("click", flipCard);
shuffleBtn.addEventListener("click", shuffleCards);
nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
flashcardEl.addEventListener("click", flipCard);

document.addEventListener("keydown", (event) => {
  if (isAnimating) return;

  if (event.key === "ArrowRight") {
    goNext();
  }

  if (event.key === "ArrowLeft") {
    goPrev();
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    flipCard();
  }
});

loadCards();