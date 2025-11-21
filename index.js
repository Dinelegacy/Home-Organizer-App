//Missing items section

const input = document.getElementById("missing-input"); 
const button = document.getElementById("missing-item");  
const list   = document.getElementById("missing-list");

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
const mealDay = document.getElementById("meal-day"); // NEW

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


const groceryInput = document.getElementById("grocery-input");
const groceryButton = document.getElementById("grocery-button");
const groceryList = document.getElementById("grocery-list");

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
