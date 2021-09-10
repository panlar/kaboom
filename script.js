const d = document,
  ls = localStorage,
  $loaded = d.getElementById("loaded"),
  $load_game = d.getElementById("load-game"),
  $levels_selector = d.getElementById("levels-selector"),
  $remaining_blocks = d.getElementById("remaining-blocks"),
  $marker = d.getElementById("marker"),
  $money = d.getElementById("money"),
  $lifes = d.getElementById("lifes"),
  $shop_lifes = d.getElementById("shop-lifes"),
  $quantity = d.getElementById("quantity"),
  $more_life = d.getElementById("more-life"),
  $less_life = d.getElementById("less-life"),
  $price = d.getElementById("price"),
  $buy = d.getElementById("buy"),
  $restart = d.getElementById("restart"),
  $record = d.getElementById("record"),
  $levels = d.querySelectorAll(".level"),
  $level_indicator = d.getElementById("level-indicator"),
  $game = d.getElementById("game"),
  $grid = d.getElementById("grid"),
  $info = d.getElementById("info"),
  $click_sound = new Audio("./click.mp3"),
  $life_sound = new Audio("./life.mp3"),
  $pop_sound = new Audio("./pop.mp3"),
  $bomb_sound = new Audio("./bomb.mp3"),
  $error_sound = new Audio("./error.mp3"),
  $load_game_sound = new Audio("./load-game.mp3"),
  $game_over_sound = new Audio("./game-over.mp3");

$load_game_sound.volume = 0.5;

const levels = {
    easy: {
      bombs: 16,
      points: 3,
    },
    normal: {
      bombs: 21,
      points: 5,
    },
    hard: {
      bombs: 26,
      points: 9,
    },
  },
  colors = {
    easy: "#1e90ff",
    normal: "#2ed573",
    hard: "#ff4757",
  };

if (
  ls.getItem("level") === null ||
  ls.getItem("money") === null ||
  ls.getItem("lifes") === null ||
  ls.getItem("record-easy") === null ||
  ls.getItem("record-normal") === null ||
  ls.getItem("record-hard") === null
) {
  ls.setItem("level", "easy");
  ls.setItem("money", "0");
  ls.setItem("lifes", "3");
  ls.setItem("record-easy", "0");
  ls.setItem("record-normal", "0");
  ls.setItem("record-hard", "0");
}

let level = ls.getItem("level"),
  record = ls.getItem("record-" + level),
  money = ls.getItem("money"),
  lifes = JSON.parse(ls.getItem("lifes")),
  quantity = 1,
  price = 15,
  marker = 0,
  color = d.documentElement.style.setProperty("--color", colors[level]);

setFavicon(level);

function loadGame() {
  $load_game_sound.play();
  setFavicon(level);

  d.querySelectorAll(".header .marker").forEach((el) => {
    el.style.opacity = 0;
    el.style.animationName = "popup";
    setTimeout(() => {
      el.style.animation = "";
      el.style.opacity = 1;
    }, 1250);
  });

  let bombs = JSON.parse(levels[level].bombs),
    blocks = 36 - bombs,
    spaces = new Array(36);

  lifes = JSON.parse(ls.getItem("lifes"));
  marker = 0;

  if (JSON.parse(ls.getItem("lifes")) < 3) {
    ls.setItem("lifes", "3");
    lifes = 3;
  }

  spaces.fill(1, 0, 36);
  spaces.forEach((x, i, a) => (a[i] = i));

  $info.innerHTML = `
  <h3 class="good-luck" style="animation: slideUp 1s forwards">BUENA<br>SUERTE<br>🤩🤩</h3>
  `;
  $remaining_blocks.textContent = blocks;
  $marker.textContent = 0;
  $lifes.textContent = lifes;
  $record.textContent = ls.getItem("record-" + level);
  $money.textContent = ls.getItem("money");

  setLevel(d.getElementById(level));

  d.getElementById(level).classList.add("selected");
  $level_indicator.textContent = d.getElementById(level).textContent;

  lessLifeButton();
  setBlocks(spaces, bombs);
  setBombs(spaces, bombs);
}

function setFavicon(level) {
  d.head
    .querySelector(".favicon")
    .setAttribute("href", `bomb-solid-${level}.svg`);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function setLevel(target) {
  $levels.forEach((level) => level.classList.remove("selected"));
  target.classList.add("selected");
  $level_indicator.textContent = target.textContent;
  ls.setItem("level", target.id);
  level = target.id;
  color = d.documentElement.style.setProperty("--color", colors[level]);
}

function setBlocks() {
  $grid.innerHTML = "";

  for (let i = 0; i < 36; i++) {
    let block = d.createElement("div");
    block.classList.add("block");
    block.style.transitionDelay = `${0.12 * i}s`;
    block.style.transform = "scale(.5)";
    $grid.appendChild(block);
  }

  d.querySelectorAll(".block").forEach((el, i, a) => {
    setTimeout(() => {
      el.style.opacity = 1;
      el.style.transform = "scale(1)";
      setTimeout(() => {
        el.style.transitionDelay = "0s";
      }, 500);
    }, 0.1 * i);
  });
}

function setBombs(arr, limit) {
  const $blocks = d.querySelectorAll(".block");

  for (let i = 0; i < limit; i++) {
    let position = getRandomInt(0, arr.length);
    $blocks[arr[position]].dataset.bomb = "true";
    arr.splice(position, 1);
  }
}

function identifyBlock(target) {
  if (target.dataset.bomb) {
    $bomb_sound.play();
    setTimeout(() => {
      $bomb_sound.pause();
      $bomb_sound.currentTime = 0;
    }, 500);
    target.classList.replace("block", "bomb");
    target.innerHTML = `<i class="bomb-img fas fa-bomb"></i>`;
    lifes--;
    ls.setItem("lifes", lifes);
    $lifes.innerHTML -= 1;
    if (lifes === 0) {
      kaboom();
      ls.setItem("lifes", "3");
      $info.innerHTML = `
      <div class="game-over">
      <h2>Juego Terminado 😵</h2>
      <br><br>
      Lastimosamente se te acabaron las vidas 🙁
      <br><br>
      Pero no te preocupes 😄
      <br><br>
      ¡Puedes volver a jugar! 🥳🥳🥳
      </div>
      `;
    }
  } else {
    $pop_sound.play();
    target.classList.replace("block", "clean");

    marker += levels[level].points;
    $marker.textContent = marker;

    money++;
    ls.setItem("money", money);
    $money.textContent = money;

    $remaining_blocks.innerHTML -= 1;

    if ($remaining_blocks.textContent === "0") {
      $info.innerHTML = `
      <div class="win">
        <h1>¡FELICIDADES!<br>🥳🥳🥳</h1>
        <h3>🤩 Eres un(a) ganador(a) 🤩</h3>
      </div>
      `;
    }

    if (marker > JSON.parse(ls.getItem("record-" + level))) {
      ls.setItem("record-" + level, marker);
      $record.textContent = marker;
    }
  }
}

function selectLifes(func) {
  if (func === "more") {
    quantity++, (price += 15);
    $quantity.textContent = quantity;
    $price.textContent = price;
  } else {
    if (quantity === 1) return;
    quantity--, (price -= 15);
    $quantity.textContent = quantity;
    $price.textContent = price;
  }
  lessLifeButton();
}

function lessLifeButton() {
  if (quantity === 1) $less_life.style.opacity = 0.5;
  else $less_life.style.opacity = 1;
}

function buyLifes() {
  if (price > money) {
    $error_sound.play();
    setTimeout(() => {
      $error_sound.pause();
      $error_sound.currentTime = 0;
    }, 300);
    $info.innerHTML = `
    <div class="insuffucient-money">
    Lo sentimos, aún no tienes dinero suficiente para comprar ${quantity} vidas
    <br><br>
    Te faltan $${price - money} para poder comprarlas.
    <br><br>
    ¡¡¡Sigue jugando para comprar más 😄🥳!!!
    </div>
    `;
  } else {
    if (lifes === 0) {
      $info.innerHTML = `
      <div>
      <h3>¡Felicidades! 🥳</h3>
      <br>
      Ahora puedes seguir jugando 🤩
      </div>
      `;
      desKaboom();
    }
    $life_sound.play();
    lifes += quantity;
    money = money - price;
    ls.setItem("lifes", lifes);
    ls.setItem("money", money);
    $money.textContent = ls.getItem("money");
    $lifes.textContent = lifes;
    $shop_lifes.classList.remove("active");
  }
}

function kaboom() {
  d.querySelectorAll(".block").forEach((el) => {
    el.style.transform = `translate(${getRandomInt(
      -120,
      121
    )}px, ${getRandomInt(-120, 121)}px)`;
  });
  $grid.classList.add("kaboom");
  $game_over_sound.play();
}

function desKaboom() {
  d.querySelectorAll(".block").forEach((el) => {
    el.style.transform = "scale(1) translateY(0)";
  });
  $grid.classList.remove("kaboom");
}

$load_game.onclick = () => {
  loadGame();
  $loaded.classList.add("hidden");
};

$levels_selector.onclick = () => {
  $levels_selector.classList.toggle("active");
  $shop_lifes.classList.remove("active");
  $click_sound.play();
};

$restart.addEventListener("click", (e) => {
  $restart.classList.add("active");
  $levels_selector.classList.remove("active");
  desKaboom();
  loadGame();
  $click_sound.play();
  setTimeout(() => {
    $restart.classList.remove("active");
  }, 500);
});

d.addEventListener("click", (e) => {
  if (e.target === $shop_lifes || e.target.matches(".shop-lifes > ion-icon")) {
    $shop_lifes.classList.toggle("active");
    $levels_selector.classList.remove("active");
    $click_sound.play();
  }

  if (e.target === $more_life || e.target.matches("#more-life ion-icon")) {
    selectLifes("more");
    $click_sound.play();
  }

  if (e.target === $less_life || e.target.matches("#less-life ion-icon")) {
    selectLifes();
    $click_sound.play();
  }

  if (e.target === $buy) {
    buyLifes();
  }

  if (e.target.matches(".level")) {
    setLevel(e.target);
    desKaboom();
    loadGame();
    $click_sound.play();
  }

  if (
    e.target.matches(".block") &&
    lifes > 0 &&
    parseInt($remaining_blocks.textContent) > 0
  ) {
    identifyBlock(e.target);
  }
});

d.oncontextmenu = () => false;

d.addEventListener("keydown", (e) => {
  if (e.keyCode === 123) {
    e.preventDefault();
  }
});
