const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const recipes = [
    {
        recipe_id: 1,
        name: "onion soup",
        type: "appetizer",
        createdAt: new Date().toISOString(),
        instructions: "Saute garlic and onion, add water and salt.",
    },
    {
        recipe_id: 2,
        name: "apple pie",
        type: "dessert",
        createdAt: new Date().toISOString(),
        instructions: "Create a dough using egg, flour, and water. Cook apple inside the dough.",
    },
];

const ingredients = [
    { ingridient_id: 1, recipe_id: 1, ingridients: "onion", quantity: "1 bulb", condition: "chopped" },
    { ingridient_id: 2, recipe_id: 1, ingridients: "salt", quantity: "1/2 teaspoon", condition: "none" },
    { ingridient_id: 3, recipe_id: 1, ingridients: "water", quantity: "1 cup", condition: "none" },
    { ingridient_id: 4, recipe_id: 1, ingridients: "garlic", quantity: "5 cloves", condition: "minced" },
    { ingridient_id: 5, recipe_id: 2, ingridients: "flour", quantity: "1 cup", condition: "none" },
    { ingridient_id: 6, recipe_id: 2, ingridients: "apple", quantity: "1 piece", condition: "diced" },
    { ingridient_id: 7, recipe_id: 2, ingridients: "sugar", quantity: "1/2 cup", condition: "none" },
    { ingridient_id: 8, recipe_id: 2, ingridients: "egg", quantity: "2 pieces", condition: "none" },
    { ingridient_id: 9, recipe_id: 2, ingridients: "water", quantity: "1 cup", condition: "none" },
];

app.get("/food", (req, res) => {
    const foodData = recipes.map((recipe) => ({ name: recipe.name, type: recipe.type }));
    res.status(200).json(foodData);
});

app.get("/food/:id", (req, res) => {
    const { id } = req.params;
    const food = recipes.find((recipe) => recipe.recipe_id == id) || `id doesn't exists`;
    const status = food ? 200 : 404;
    res.status(status).json(food);
});

app.get("/food/type/:type", (req, res) => {
    const { type } = req.params;
    const food = recipes.filter((recipe) => recipe.type == type);
    if (food.length === 0) {
        res.status(404).json({ message: "Type doesn't exist" });
    } else {
        res.status(200).json(food);
    }
});

app.post("/recipe", (req, res) => {
    const { name, type, instructions } = req.body;
    const newRecipe = {
        recipe_id: recipes.length + 1,
        name,
        type,
        createdAt: new Date().toISOString(),
        instructions,
    };
    recipes.push(newRecipe);
    res.status(201).json(newRecipe);
});

app.post("/ingredients/:recipe_id", (req, res) => {
    const { recipe_id } = req.params;
    const { ingredients: newIngredients } = req.body;
    const addedIngredients = newIngredients.map((ingredient) => ({
        ingridient_id: ingredients.length + 1,
        recipe_id: parseInt(recipe_id),
        ...ingredient,
    }));
    ingredients.push(...addedIngredients);
    res.status(201).json(addedIngredients);
});

app.patch("/food/:id", (req, res) => {
    const { id } = req.params;
    const { name, type, instructions } = req.body;
    const foodIndex = recipes.findIndex((recipe) => recipe.recipe_id == id);
    if (foodIndex !== -1) {
        recipes[foodIndex] = { ...recipes[foodIndex], name, type, instructions };
        res.status(200).json({ name });
    } else {
        res.status(404).json({ message: "Food not found" });
    }
});

app.patch("/ingredients/:recipe_id", (req, res) => {
    const { recipe_id } = req.params;
    const { ingredients: updatedIngredients } = req.body;
    const updatedIngredientIds = updatedIngredients.map((ingredient) => ingredient.ingridient_id);
    ingredients.forEach((ingredient, index) => {
        if (ingredient.recipe_id == recipe_id && updatedIngredientIds.includes(ingredient.ingridient_id)) {
            ingredients[index] = updatedIngredients.find(
                (updated) => updated.ingridient_id == ingredient.ingridient_id
            );
        }
    });
    res.status(200).json({ message: "Ingredients updated" });
});

app.delete("/ingredient/:id", (req, res) => {
    const { id } = req.params;
    const ingredientIndex = ingredients.findIndex((ingredient) => ingredient.ingridient_id == id);
    if (ingredientIndex !== -1) {
        ingredients.splice(ingredientIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Ingredient not found" });
    }
});

app.delete("/food/:id", (req, res) => {
    const { id } = req.params;
    const foodIndex = recipes.findIndex((recipe) => recipe.recipe_id == id);
    if (foodIndex !== -1) {
        recipes.splice(foodIndex, 1);
        const deletedIngredients = ingredients.filter((ingredient) => ingredient.recipe_id == id);
        deletedIngredients.forEach((ingredient) => {
            const ingredientIndex = ingredients.findIndex((ing) => ing.ingridient_id == ingredient.ingridient_id);
            if (ingredientIndex !== -1) {
                ingredients.splice(ingredientIndex, 1);
            }
        });
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Recipe not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
