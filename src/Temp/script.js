const main = document.getElementById('cards-container');
for (let i = 0; i < 10; i++) {
  const newDiv = document.createElement('div');
  newDiv.className = 'match-card';
  newDiv.classList.add(Math.random() > 0.5 ? 'win' : 'loss');
  main.appendChild(newDiv);
}

// get all elements with class name 'match-card'
const cards = document.getElementsByClassName('match-card');
// iterate over all elements
for (let i = 0; i < cards.length; i++) {
  // add event listener to each element
  cards[i].addEventListener('click', (event) => {
    const selectedCards = document.getElementsByClassName('selected');
    // iterate over all elements
    for (let j = 0; j < selectedCards.length; j++) {
      // remove class name 'selected' from each element
      selectedCards[j].classList.remove('selected');
    }
    // toggle class name 'selected' on each element
    event.target.classList.toggle('selected');
  });
}

document.getElementById('video-screen').addEventListener('click', function () {
  const rightPanel = document.getElementById('right-container');
  console.log(rightPanel.classList)
  rightPanel.classList.toggle('hidden');
});

const matchLength = 1200000;

// const highlights =
//   [{
//     start: 15000,
//     end: 45000
//   },
//   {
//     start: 45000,
//     end: 90000
//   },
//   {
//     start: 90000,
//     end: 120000
//   },
//   {
//     start: 1380000,
//     end: 150000
//   },
//   {
//     start: 170000,
//     end: 180000
//   },
//   ]

// create random highglihgts for testing
const highlights = [];
for (let i = 0; i < Math.floor(Math.random() * 30); i++) {
  const duration = Math.random() * 60000 + 5000;
  const start = Math.random() * (matchLength);
  highlights.push({
    start: start,
    end: Math.min(start + duration, matchLength)
  })
  // if overlap try again
  if (highlights.filter((highlight) => {
    return (highlight.start < start && highlight.end > start) || (highlight.start < start + duration && highlight.end > start + duration)
  }).length > 1) {
    highlights.pop();
    i--;
  }
}


const highlightContainer = document.getElementById('events-container');
highlights.forEach((event) => {
  const newDiv = document.createElement('div');
  newDiv.className = 'highlight-bar';
  newDiv.style.left = `${(event.start / matchLength) * 100}%`;
  newDiv.style.width = `${((event.end - event.start) / matchLength) * 100}%`;
  highlightContainer.appendChild(newDiv);
}
)

// ((card) => {
//   console.log("run");
//   // add event listener to each element
//   card.addEventListener('click', (event) => {
//     const selectedCards = document.getElementsByClassName('selected');
//     selectedCards.forEach((selectedCard) => {
//       // remove class name 'selected' from each element
//       selectedCard.classList.remove('selected');
//     })
//     // toggle class name 'selected' on each element
//     event.target.classList.toggle('selected');
//   });
// })