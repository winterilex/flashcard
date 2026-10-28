(function () {
  var STORAGE_KEY = "flashcard_v1";

  var form = document.getElementById("add-form");
  var frontInput = document.getElementById("front-input");
  var backInput = document.getElementById("back-input");
  var cardList = document.getElementById("card-list");
  var emptyState = document.getElementById("empty-state");
  var formError = document.getElementById("form-error");
  var formErrorClear = document.getElementById("form-error-clear");
  var shuffleButton = document.getElementById("shuffle-button");
  var addView = document.getElementById("add-view");
  var listView = document.getElementById("list-view");
  var listButton = document.getElementById("list-button");
  var backToAddButton = document.getElementById("back-to-add-button");
  var singleWordView = document.getElementById("single-word-view");
  var singleCardContainer = document.getElementById("single-card-container");
  var nextCardButton = document.getElementById("next-card-button");
  var shuffleSingleButton = document.getElementById("shuffle-single-button");
  var backToAddSingleButton = document.getElementById("back-to-add-single-button");
  var returnFromSingleButton = document.getElementById("return-from-single-button");
  var upBatchButton = document.getElementById("up-batch-button");
  var downBatchButton = document.getElementById("down-batch-button");
  var randomToggleButton = document.getElementById("random-toggle-button");
  var randomToggleCheckbox = document.getElementById("random-toggle-checkbox");
  var sideSelectButton = document.getElementById("side-select-button");

  var randomToggleSingleButton = document.getElementById("random-toggle-single-button");
  var randomToggleSingleCheckbox = document.getElementById("random-toggle-single-checkbox");
  var sideSelectSingleButton = document.getElementById("side-select-single-button");

  var START_MODE_KEY = "flashcard_v1_start";
  var BATCH_SIZE = 3;
  var batchIndex = 0;

  var cards = loadCards();
  var flipped = {};
  var currentSingleIndex = 0;
  var previousView = null;
  var startState = loadStartState();
  var isRandomMode = startState.random;
  var startSide = startState.side;

  function loadCards() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(function (item) {
          return item && typeof item === "object";
        })
        .map(function (item) {
          return {
            id: String(item.id || makeId()),
            front: String(item.front || ""),
            back: String(item.back || ""),
          };
        });
    } catch (err) {
      return [];
    }
  }

  function saveCards() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (err) {
      // Storage may be full or blocked; keep the in-memory list usable.
    }
  }

  function loadStartState() {
    try {
      var raw = localStorage.getItem(START_MODE_KEY);
      if (!raw) {
        return { random: false, side: "front" };
      }
      var parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.random === true || parsed.random === false) &&
        (parsed.side === "front" || parsed.side === "back")
      ) {
        return parsed;
      }
      return { random: false, side: "front" };
    } catch (err) {
      return { random: false, side: "front" };
    }
  }

  function saveStartState() {
    try {
      localStorage.setItem(START_MODE_KEY, JSON.stringify({ random: isRandomMode, side: startSide }));
    } catch (err) {
      // Storage may be full or blocked; keep the in-memory state usable.
    }
  }

  function makeId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function shuffleCards() {
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
  }

  function getInitialFlipped(card) {
    if (!isRandomMode && flipped[card.id] !== undefined) {
      return flipped[card.id];
    }
    if (isRandomMode) {
      return Math.random() < 0.5;
    }
    return startSide === "back";
  }

  function updateBatchButtons() {
    var atTop = batchIndex <= 0;
    var atBottom = (batchIndex + 1) * BATCH_SIZE >= cards.length;
    upBatchButton.disabled = atTop;
    downBatchButton.disabled = atBottom;
  }

  function updateModeButtons() {
    randomToggleCheckbox.checked = isRandomMode;
    randomToggleSingleCheckbox.checked = isRandomMode;
    if (isRandomMode) {
      sideSelectButton.hidden = true;
      sideSelectSingleButton.hidden = true;
    } else {
      sideSelectButton.hidden = false;
      sideSelectSingleButton.hidden = false;
    }
    sideSelectButton.textContent = startSide.charAt(0).toUpperCase() + startSide.slice(1) + " First";
    sideSelectSingleButton.textContent = startSide.charAt(0).toUpperCase() + startSide.slice(1) + " First";
  }

  function enterSingleView(fromView) {
    previousView = fromView;
    currentSingleIndex = 0;
    addView.hidden = true;
    listView.hidden = true;
    singleWordView.hidden = false;
    renderSingleCard();
  }

  function renderSingleCard() {
    singleCardContainer.innerHTML = "";
    if (cards.length === 0) {
      singleCardContainer.textContent = "No cards yet.";
      return;
    }
    var card = cards[currentSingleIndex];
    var showBack = getInitialFlipped(card);

    var face = document.createElement("button");
    face.type = "button";
    face.className = "card-face";
    face.setAttribute("aria-label", "Flip card");

    var side = document.createElement("span");
    side.className = "card-side";
    side.textContent = showBack ? "Back" : "Front";

    var text = document.createElement("div");
    text.className = "card-text";
    text.textContent = showBack ? card.back : card.front;

    face.appendChild(side);
    face.appendChild(text);
    face.addEventListener("click", function () {
      flipped[card.id] = !flipped[card.id];
      renderSingleCard();
    });

    var indexIndicator = document.createElement("div");
    indexIndicator.textContent = (currentSingleIndex + 1) + " / " + cards.length;
    indexIndicator.style.fontSize = "0.9rem";
    indexIndicator.style.color = "#666";
    indexIndicator.style.marginTop = "0.5rem";

    singleCardContainer.appendChild(face);
    singleCardContainer.appendChild(indexIndicator);
  }

  function nextCard() {
    if (cards.length === 0) {
      return;
    }
    currentSingleIndex = (currentSingleIndex + 1) % cards.length;
    renderSingleCard();
  }

  function returnFromSingle() {
    singleWordView.hidden = true;
    addView.hidden = true;
    listView.hidden = false;
    render();
  }

  function render() {
    cardList.innerHTML = "";
    emptyState.hidden = cards.length > 0;

    var start = batchIndex * BATCH_SIZE;
    var end = Math.min((batchIndex + 1) * BATCH_SIZE, cards.length);
    var visibleCards = cards.slice(start, end);
    visibleCards.forEach(function (card) {
      var showBack = getInitialFlipped(card);
      var li = document.createElement("li");
      li.className = "card";

      var face = document.createElement("button");
      face.type = "button";
      face.className = "card-face";
      face.setAttribute("aria-label", "Flip card");

      var side = document.createElement("span");
      side.className = "card-side";
      side.textContent = showBack ? "Back" : "Front";

      var text = document.createElement("div");
      text.className = "card-text";
      text.textContent = showBack ? card.back : card.front;

      face.appendChild(side);
      face.appendChild(text);
      face.addEventListener("click", function () {
        flipped[card.id] = !flipped[card.id];
        render();
      });

      var del = document.createElement("button");
      del.type = "button";
      del.className = "card-delete";
      del.textContent = "Delete";
      del.addEventListener("click", function () {
        cards = cards.filter(function (c) {
          return c.id !== card.id;
        });
        delete flipped[card.id];
        saveCards();
        batchIndex = 0;
        render();
      });

      li.appendChild(face);
      li.appendChild(del);
      cardList.appendChild(li);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var front = frontInput.value.trim();
    var back = backInput.value.trim();
    if (!front || !back) {
      formError.hidden = false;
      return;
    }
    formError.hidden = true;
    cards.push({
      id: makeId(),
      front: front,
      back: back,
    });
    frontInput.value = "";
    backInput.value = "";
    saveCards();
    batchIndex = 0;
    render();
    frontInput.focus();
  });

  function hideFormError() {
    formError.hidden = true;
  }

  frontInput.addEventListener("input", hideFormError);
  backInput.addEventListener("input", hideFormError);
  formErrorClear.addEventListener("click", hideFormError);

  shuffleButton.addEventListener("click", function () {
    shuffleCards();
    saveCards();
    batchIndex = 0;
    render();
  });

  listButton.addEventListener("click", function () {
    addView.hidden = true;
    listView.hidden = false;
    render();
  });

  backToAddButton.addEventListener("click", function () {
    listView.hidden = true;
    addView.hidden = false;
  });

  document.getElementById("single-view-button-add").addEventListener("click", function () {
    enterSingleView("add");
  });

  document.getElementById("single-view-button-list").addEventListener("click", function () {
    enterSingleView("list");
  });

  nextCardButton.addEventListener("click", function () {
    nextCard();
  });

  returnFromSingleButton.addEventListener("click", function () {
    returnFromSingle();
  });

  shuffleSingleButton.addEventListener("click", function () {
    shuffleCards();
    saveCards();
    renderSingleCard();
  });

  backToAddSingleButton.addEventListener("click", function () {
    singleWordView.hidden = true;
    addView.hidden = false;
  });

  upBatchButton.addEventListener("click", function () {
    batchIndex = Math.max(0, batchIndex - 1);
    updateBatchButtons();
    render();
  });

  downBatchButton.addEventListener("click", function () {
    batchIndex = Math.min(Math.floor((cards.length - 1) / BATCH_SIZE), batchIndex + 1);
    updateBatchButtons();
    render();
  });

  randomToggleCheckbox.addEventListener("change", function () {
    isRandomMode = randomToggleCheckbox.checked;
    saveStartState();
    updateModeButtons();
    render();
    renderSingleCard();
  });

  sideSelectButton.addEventListener("click", function () {
    if (isRandomMode) {
      return;
    }
    startSide = startSide === "front" ? "back" : "front";
    saveStartState();
    updateModeButtons();
    render();
    renderSingleCard();
  });

  randomToggleSingleCheckbox.addEventListener("change", function () {
    isRandomMode = randomToggleSingleCheckbox.checked;
    saveStartState();
    updateModeButtons();
    render();
    renderSingleCard();
  });

  sideSelectSingleButton.addEventListener("click", function () {
    if (isRandomMode) {
      return;
    }
    startSide = startSide === "front" ? "back" : "front";
    saveStartState();
    updateModeButtons();
    render();
    renderSingleCard();
  });

  updateBatchButtons();
  updateModeButtons();

  singleWordView.hidden = true;

  render();
})();
