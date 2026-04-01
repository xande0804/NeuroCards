const flashcardSceneEl = document.getElementById("flashcardScene");
const flashcardEl = document.getElementById("flashcard");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const counterEl = document.getElementById("counter");
const toggleBtn = document.getElementById("toggleBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const statusMessageEl = document.getElementById("statusMessage");

let flashcards = [];
let currentIndex = 0;
let isFlipped = false;
let isAnimating = false; 

function updateFlipState(flipped) {
  isFlipped = flipped;
  flashcardEl.classList.toggle("is-flipped", isFlipped);
  toggleBtn.textContent = isFlipped ? "Ver pergunta" : "Ver resposta";
}

function renderCard() {
  if (!flashcards.length) {
    questionEl.textContent = "Nenhum flashcard encontrado.";
    answerEl.textContent = "Verifique seu cards.json ou se você está rodando um servidor local.";
    counterEl.textContent = "0 / 0";
    // Deixei o botão de girar ativo mesmo com erro para você poder girar o card vazio!
    toggleBtn.disabled = false;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    updateFlipState(false);
    return;
  }

  const currentCard = flashcards[currentIndex];
  questionEl.innerHTML = currentCard.question;
  answerEl.innerHTML = currentCard.answer;
  counterEl.textContent = `${currentIndex + 1} / ${flashcards.length}`;

  updateFlipState(false);
}

function flipCard() {
  // Impede que clique no meio da animação lateral quebre o layout
  if (isAnimating) return;
  updateFlipState(!isFlipped);
}

function goNext() {
  if (!flashcards.length || isAnimating) return;
  isAnimating = true;

  // Blindagem: se faltar o id no HTML, ele só troca o conteúdo sem animar em vez de travar
  if (flashcardSceneEl) {
    flashcardSceneEl.classList.add("slide-out-left");

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % flashcards.length;
      renderCard(); 

      flashcardSceneEl.classList.remove("slide-out-left");
      flashcardSceneEl.classList.add("slide-in-right");

      setTimeout(() => {
        flashcardSceneEl.classList.remove("slide-in-right");
        isAnimating = false;
      }, 300);
    }, 300);
  } else {
    currentIndex = (currentIndex + 1) % flashcards.length;
    renderCard();
    isAnimating = false;
  }
}

function goPrev() {
  if (!flashcards.length || isAnimating) return;
  isAnimating = true;

  if (flashcardSceneEl) {
    flashcardSceneEl.classList.add("slide-out-right");

    setTimeout(() => {
      currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
      renderCard();

      flashcardSceneEl.classList.remove("slide-out-right");
      flashcardSceneEl.classList.add("slide-in-left");

      setTimeout(() => {
        flashcardSceneEl.classList.remove("slide-in-left");
        isAnimating = false;
      }, 300);
    }, 300);
  } else {
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    renderCard();
    isAnimating = false;
  }
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

    flashcards = data.filter(
      (item) =>
        item &&
        typeof item.question === "string" &&
        typeof item.answer === "string"
    );

    if (!flashcards.length) {
      throw new Error("Nenhum card válido foi encontrado em cards.json.");
    }

    renderCard();
  } catch (error) {
    console.error(error);
    statusMessageEl.textContent = "Erro ao carregar os flashcards. Verifique o console.";
    
    // Mostra um erro direto no cartão
    flashcards = []; 
    renderCard();
  }
}

// Event Listeners
toggleBtn.addEventListener("click", flipCard);
nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
flashcardEl.addEventListener("click", flipCard);

// Controles pelo teclado
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") goNext();
  if (event.key === "ArrowLeft") goPrev();
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault(); 
    flipCard();
  }
});

// Inicialização
loadCards();