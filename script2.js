let currFolder; // Current folder
let songs = []; // List of songs
let currentIndex = -1; // Index of the current song
let audio = new Audio(); // Audio object
let currentPlayButton = null; // Track the currently active play button
let currentSrc = ""; // Current audio source

// Fetch and parse songs from a folder
async function getSongs(folder) {
  currFolder = folder; // Save the current folder
  let response = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
  let html = await response.text();

  let div = document.createElement("div");
  div.innerHTML = html;
  let links = div.getElementsByTagName("a");

  // Filter and process songs
  songs = Array.from(links)
    .filter((link) => link.href.endsWith(".mp3"))
    .map((link) => ({
      name: link.title
        .replace(".mp3", "")
        .replace("_CeeNaija.com_", "")
        .replaceAll("_", " "),
      link: link.href,
    }));

  return songs;
}
document.querySelector(".left").style.display = "none"; // Hides but keeps space

// Generate song list dynamically
async function main(folder) {
  songs = await getSongs(folder);

  // Populate the song list
  let songUl = document.querySelector(".songsList ul");
  songUl.innerHTML = songs
    .map(
      (song, index) => `
    <li data-index="${index}">
      <img src="./images/music.svg" alt="">
      <div class="songInfo">
        <div class="songName">${song.name.split("-")[1]}</div>
        <div class="songLink">${song.link}</div>
        <div>${song.name.split("-")[0]}</div>
      </div>
      <div class="play">
        <p>Play now</p>
        <img src="./images/pause.svg" alt="" width="16" height="16">
      </div>
    </li>
  `
    )
    .join("");

  attachPlayEvents(); // Reattach play events for new songs
}

// Attach play/pause events to song list items
function attachPlayEvents() {
  document.querySelectorAll(".songsList > ul > li").forEach((li, index) => {
    li.addEventListener("click", () => {
      playSong(index); // Play song at the clicked index
    });
  });
}

// Play a specific song by index
function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  const song = songs[index];

  // Update audio source and play
  if (currentSrc !== song.link) {
    if (currentPlayButton) currentPlayButton.src = "./images/pause.svg";

    audio.src = song.link;
    currentSrc = song.link;
    currentIndex = index;

    // Update UI
    let songListItems = document.querySelectorAll(".songsList > ul > li");
    currentPlayButton = songListItems[index].querySelector(".play img");
    currentPlayButton.src = "./images/play.svg";
    document.querySelector(".songinfo").textContent = song.name.split("-")[1];

    audio.play();
  } else {
    togglePlayPause(); // Toggle play/pause for the current song
  }
}

// Toggle play/pause
function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    if (currentPlayButton) currentPlayButton.src = "./images/play.svg";
  } else {
    audio.pause();
    if (currentPlayButton) currentPlayButton.src = "./images/pause.svg";
  }
}

play.addEventListener("click", ()=>{
  if(songs){
if(!currentSrc){
  playSong(0)
}
else{
  togglePlayPause()
}
  }
})

// Previous button functionality
previous.addEventListener("click", () => {
  let prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
  playSong(prevIndex);
});

// Next button functionality
next.addEventListener("click", () => {
  let nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
  playSong(nextIndex);
});

// Time update and progress bar
audio.addEventListener("timeupdate", () => {
  let currentTime = audio.currentTime;
  let duration = audio.duration;

  if (!isNaN(duration)) {
    // Update time display
    let currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, "0");
    let totalMinutes = Math.floor(duration / 60);
    let totalSeconds = Math.floor(duration % 60).toString().padStart(2, "0");
    document.querySelector(".songtime").textContent = `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`;

    // Update progress bar
    let progressBar = document.querySelector(".round");
    progressBar.style.left = `${(currentTime / duration) * 100}%`;
  }
});

// Seek bar functionality
document.querySelector(".seekbar").addEventListener("click", (e) => {
  let seekbar = e.currentTarget;
  let clickPosition = e.offsetX / seekbar.offsetWidth;
  audio.currentTime = clickPosition * audio.duration;
});

// Volume control
let volumeSlider = document.querySelector(".volume input");
volumeSlider.addEventListener("input", () => {
  let volumeValue = volumeSlider.value / 100;
  audio.volume = volumeValue;

  // Update volume icon
  let volumeIcon = document.querySelector(".vol");
  volumeIcon.src = volumeValue < 0.1 ? "./images/volumeMute.svg" : "./images/volume.svg";
});

// Folder card click event
let previousCard = null; // Store previous clicked card


document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", async (e) => {
    let currentCard = e.currentTarget; // The clicked card

    let folder = currentCard.dataset.folder;

    await main(folder);
    document.querySelector(".left").style.display = "block"; // Show left panel

    // 🔴 Remove styles from the previously clicked card
    if (previousCard && previousCard !== currentCard) {
      previousCard.style.backgroundColor = ""; // Reset to default
      let prevCircle = previousCard.querySelector(".circle");
      if (prevCircle) {
        prevCircle.style.opacity = "0";
        prevCircle.style.top = ""; // Reset position
      }
    }

    // 🟢 Apply styles to the currently clicked card
    currentCard.style.backgroundColor = "#2e3f3d";
    let circle = currentCard.querySelector(".circle");
    if (circle) {
      circle.style.opacity = "1";
      circle.style.top = "50%";
    }

    // ✅ Update previousCard to the current one
    previousCard = currentCard;

  });
});




// Audio event listeners for button sync
audio.addEventListener("play", () => {
  if (currentPlayButton) currentPlayButton.src = "./images/play.svg";
  play.src = "./images/play.svg";
});
audio.addEventListener("pause", () => {
  if (currentPlayButton) currentPlayButton.src = "./images/pause.svg";
  play.src = "./images/pause.svg";
});
audio.addEventListener("ended", () => {
  next.click(); // Automatically play the next song when one ends
});

//keyboard events
document.addEventListener('keydown',(e)=>{
  switch (e.key) {
    case ' ': // Spacebar
    e.preventDefault()
    if(songs){
      if(!currentSrc){
        playSong(0)
      }
      else{
        togglePlayPause()
      }
        }      break;
    case 'ArrowLeft': // Left arrow
    e.preventDefault()
      previous.click();
      break;
    case 'ArrowRight': // Right arrow
    e.preventDefault()
      next.click();
      break;
    case 'ArrowUp': 
    e.preventDefault()
    volumeSlider.value = Math.min(volumeSlider.valueAsNumber+5, 100);
    audio.volume = volumeSlider.value / 100;
    console.log(volumeSlider.value,audio.volume)
    break;
    case 'ArrowDown':
      e.preventDefault()
      volumeSlider.value = Math.max(volumeSlider.valueAsNumber - 5, 0);
      audio.volume = volumeSlider.value / 100;
     console.log(volumeSlider.value)
    break;
  }

})