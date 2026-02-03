//Missing items section
// Connect GET 

const API_URL = "http://localhost:3000/api/items";

async function loadItems() {
    const res = await fetch("http://localhost:3000/api/items")
    const data = await res.json();

    list.innerHTML = "";

    data.forEach(item  => {
        const li = document.createElement("li");
        li.textContent = item.text;

        list.appendChild(li);
        
    });
    
    
}

loadItems();





const input = document.getElementById("missing-input"); 
const button = document.getElementById("missing-item");  
const list   = document.getElementById("missing-list");

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        button.click();
    }
}); // for enter click


button.addEventListener("click", () =>{

    if (input.value.trim() === "") {
    return; // Trim() removes spaces at starts and end, and === "" checks if the string is empty 
}
    const value = input.value;  
    console.log(value);        

    const newLi = document.createElement("li");
    newLi.textContent = input.value 

    const removeBtn = document.createElement("button"); // create a button to delete or remove items
    removeBtn.textContent = "🗑️";   // adding textContent to remove or delete the items
    removeBtn.addEventListener("click" , () => {
        newLi.remove();
    })
    newLi.appendChild(removeBtn);
    list.appendChild(newLi);

    input.value = "";  // To clears the input so user can type a new item 

    

});

//Weekly meal section 

const mealInput = document.getElementById("meal-input");
const mealButton = document.getElementById("meal-button");
const mealList = document.getElementById("meal-list");
const mealDay = document.getElementById("meal-day"); 

mealInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    mealButton.click();      // meal section button
  }
}); // for enter click 


mealButton.addEventListener("click", () => {
    
    // prevent empty day or empty meal
    if (mealInput.value.trim() === "" || mealDay.value === "") {
        return;
    }

    const value = mealInput.value;
    console.log(value);

    const secondLi = document.createElement("li");
    secondLi.textContent = `${mealDay.value}: ${mealInput.value}`; // UPDATED

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.addEventListener("click", () => {
        secondLi.remove();
    });

    secondLi.appendChild(removeBtn);
    mealList.appendChild(secondLi);

    mealInput.value = "";
    mealDay.value = ""; // reset day
});

// Grocery section 
const groceryInput = document.getElementById("grocery-input");
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
