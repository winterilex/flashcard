(function () {
  var STORAGE_KEY = "flashcard_v1";

  var form = document.getElementById("add-form");
  var frontInput = document.getElementById("front-input");
  var backInput = document.getElementById("back-input");
  var cardList = document.getElementById("card-list");
  var emptyState = document.getElementById("empty-state");
  var formError = document.getElementById("form-error");
  var formErrorClear = document.getElementById("form-error-clear");

  var cards = loadCards();
  var flipped = {};

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

  function makeId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function render() {
    cardList.innerHTML = "";
    emptyState.hidden = cards.length > 0;

    cards.forEach(function (card) {
      var showBack = !!flipped[card.id];
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
    render();
    frontInput.focus();
  });

  function hideFormError() {
    formError.hidden = true;
  }

  frontInput.addEventListener("input", hideFormError);
  backInput.addEventListener("input", hideFormError);
  formErrorClear.addEventListener("click", hideFormError);

  render();
})();
