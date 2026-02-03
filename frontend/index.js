
// Missing items section (Dom Elements)

const list = document.getElementById("missing-list");
const input = document.getElementById("missing-input");
const button = document.getElementById("missing-item");

// Backend API endpoints (Express Server)
const ITEMS_URL = "http://localhost:3000/api/items";

// Fetch items from backend API (Backend reads from MongoDB)
async function loadItems() {
  const res = await fetch(ITEMS_URL);   // frontend → backend request
  const data = await res.json(); // backend → frontend response (from database)

  list.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.text;

      // Delete through backend API (backend deletes from MongoDB)
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.addEventListener("click", async () => {
      await fetch(`${ITEMS_URL}/${item._id}`, { method: "DELETE" });
      loadItems(); // refresh list
    });

    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

loadItems();

// Enter key triggers button click
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") button.click();
});

//  add item to database
button.addEventListener("click", async () => {
  const text = input.value.trim();
  if (text === "") return;

  const res = await fetch(ITEMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    alert("Failed to save item");
    return;
  }

  input.value = "";
  loadItems(); // reload from DB so it persists + shows delete button
});

// Weekly meal section (DOM Element)

const mealInput = document.getElementById("meal-input");
const mealButton = document.getElementById("meal-button");
const mealList = document.getElementById("meal-list");
const mealDay = document.getElementById("meal-day");

// Backend API endpoint (Express Server)
const MEALS_URL = "http://localhost:3000/api/meals";

// Fetch meals from backend API (backend reads from MongoDB)
async function loadMeals() {
  const res = await fetch(MEALS_URL); // frontend → backend request

  const data = await res.json();  // backend → frontend response (from database)


  mealList.innerHTML = "";

  data.forEach((meal) => {
    const li = document.createElement("li");
    li.textContent = `${meal.day}: ${meal.text}`;

    // Delete through backend API (backend deletes from MongoDB)

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.addEventListener("click", async () => {
      await fetch(`${MEALS_URL}/${meal._id}`, { method: "DELETE" });
      loadMeals();
    });

    li.appendChild(removeBtn);
    mealList.appendChild(li);
  });
}

loadMeals();

mealInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    mealButton.click();
  }
});

mealButton.addEventListener("click", async () => {
  const day = mealDay.value;
  const text = mealInput.value.trim();

  if (!day || !text) return;

  const res = await fetch(MEALS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day, text }),
  });

  if (!res.ok) {
    alert("Failed to save meal");
    return;
  }

  mealInput.value = "";
  mealDay.value = "";
  loadMeals();
});


// Grocery section 
/* const groceryInput = document.getElementById("grocery-input");
const groceryButton = document.getElementById("grocery-button");
const groceryList = document.getElementById("grocery-list");

groceryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    groceryButton.click();   // grocery section button
  }
});  // for enter click 


groceryButton.addEventListener("click" , () =>{
    if (groceryInput.value.trim() === "") {
        return;
    }
    const value = groceryInput.value;
    console.log(value);

    const selectList = document.createElement("li");
    selectList.textContent = groceryInput.value;

 const removeBtn = document.createElement("button"); // create a button to delete or remove items
    removeBtn.textContent = "🗑️"; // adding textContent to remove or delete the items
    removeBtn.addEventListener("click" , () => {
        selectList.remove();
    })
    
    selectList.appendChild(removeBtn);
    groceryList.appendChild(selectList);

    groceryInput.value = "" ;

})
 */