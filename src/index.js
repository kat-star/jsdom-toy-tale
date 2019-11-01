let addToy = false

let allToys = [];

document.addEventListener("DOMContentLoaded", ()=>{
  const addBtn = document.querySelector('#new-toy-btn')
  const toyForm = document.querySelector('.container')
  addBtn.addEventListener('click', () => {
    // hide & seek with the form
    addToy = !addToy
    if (addToy) {
      toyForm.style.display = 'block'
    } else {
      toyForm.style.display = 'none'
    }
  })
  fetchToys();
  listenForSubmit();
  listenForLike();
})

//fetching the toys from the API. Then, it will get the toy container and change all of the inner HTML by mapping over the JSON object and rendering each toy with my render toy function (HTML string)
function fetchToys() {
  fetch('http://localhost:3000/toys')
    .then(response => response.json())
    .then(data => {
      allToys = data;
      getToyContainer().innerHTML = allToys
        .map(toy => renderSingleToy(toy))
        .join('');
    });
}

//function to get the toy container (will have to append new toys into it). Probably better to make it a constant variable
  function getToyContainer() {
    return document.getElementById('toy-collection');
  }


//this renders a single toy and creates a new card for it
function renderSingleToy(toy) {
  return `
  <div class="card" id="${toy.id}">
    <h2>${toy.name}</h2>
    <img src="${toy.image}" class="toy-avatar" />
    <p>${toy.likes} Likes </p>
    <button class="like-btn" data-id="${toy.id}" >Like <3</button>
  </div >`;
}

//will listen for 'submit' clicks. If something submitted, will then run getToyInfo
//narrowed down the scope of the event listener by finding the form submit class name vs. document.addEventListener
function listenForSubmit() {
  // const formElement = document.getElementsByClassName('add-toy-form')[0]
document.addEventListener('submit', function(event) {
    event.preventDefault();
    getToyInfo(event);
  });
}

//getToyInfo will then run, which puts together a new toy object that will be passed into createToy
function getToyInfo(event) {
  const form = event.target;
  const name = form.name.value;
  const image = form.image.value;
  const likes = 0;

  const newToy = {
    name: name,
    image: image,
    likes: likes
  };
  createToy(newToy);
}

//createToy will post a fetch to create a new toy that gets appended to the toy container. Since renderSingleToy goes through and creates a new HTML string 
//when we create a new toy, 1) send a post request to the database 2)update the DOM to reflect the new toy
function createToy(toy) {
  fetch('http://localhost:3000/toys', {
    method: 'POST',
    headers:
    {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(toy)
  })
  .then(response => response.json())
  .then(data => {
    allToys.push(data);
    // const newToy = renderSingleToy(data);
    // const newToy = document.createElement('div');
    // newToy.innerHTML = renderSingleToy(data);
    getToyContainer().insertAdjacentHTML('beforeend', renderSingleToy(data))
  });
}

// function will listen for a like click on toy container. Once clicked, send a patch request to update likes by 1
//listenForLike listener added to the parent node so that any clicks inside will fire, and the if statement will only make those clicks on the button be the one to go through (event bubbling/event delegation)
function listenForLike() {
  getToyContainer().addEventListener('click', (event) => {
    if (event.target.className === 'like-btn' ) {
      const toyId = parseInt(event.target.dataset.id);
      const toy = allToys.find(element => toyId === element.id);
      updateLikeCount(toy);
    }
  });
}

//the patch request. Once I get the updated object back, update the DOM, and update the like count from the allToys
function updateLikeCount(toy) {
  fetch(`http://localhost:3000/toys/${toy.id}`, {
    method: 'PATCH',
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify( {
      likes: (toy.likes + 1)
    })
  })
  .then(response => response.json())
  .then(data => {
    const card = document.getElementById(data.id)
    const likesText = card.getElementsByTagName('p')[0]
    likesText.innerHTML = `${data.likes} Likes`
    toy.likes = data.likes
  });
}
