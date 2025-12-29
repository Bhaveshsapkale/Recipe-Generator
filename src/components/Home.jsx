import React, { useState } from 'react'
import { ChefHat, Plus, X, Loader2, Clock, Users, FileJsonIcon } from 'lucide-react'; //icons from react lucide library

const Home = () => {
    const [loading, setLoading] = useState(false)
    const [ingredients, setIngredients] = useState([])
    const [recipe, setRecipe] = useState(null)
    const [inputValue, setInputValues] = useState('')
    const [error, setError] = useState('')

    const addIngredient = () => {
        if(inputValue.trim() !== '') {
            setIngredients([...ingredients, inputValue.trim()])
            setInputValues('')
        }
    }

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index))
    }

    const generateRecipe = async () => {
        if(ingredients.length === 0) {
            setError('Please add at least one ingredient')
            return
        }

        setLoading(true)
        setError('')
        setRecipe(null)
         
        try {
            const response = await fetch('/api/recipe',{
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: `Please generate a recipe using these ingredients: ${ingredients.join(', ')}. 
                    format the recipe EXACTLY as valid JSON with this structure:
                    {
                        "title": "Recipe name",
                        "description": "Recipe description",
                        "prepTime": "15 minutes",
                        "cookTime": "30 minutes",
                        "servings": "4",
                        "ingredients": [
                            "Ingredient 1",
                            "Ingredient 2",
                            "Ingredient 3"
                        ],
                        "instructions": [
                            "Instruction 1",
                            "Instruction 2",
                            "Instruction 3"
                        ]
                    } 
                    only respond with JSON, no other text.`
                })
            });
            
            const data = await response.json();

            if(data.content && data.content[0]?.text){
                const text = data.content[0].text.trim();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                
                if(jsonMatch){
                    const recipeData = JSON.parse(jsonMatch[0]);
                    setRecipe(recipeData)
                } else{
                    throw new Error('Invalid response format')
                }
            }
            
        } catch (error) {
            setError("Failed to generate recipe, Please try again later:)")
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
                    <div className='bg-green-500 p-8 text-white'>
                        <div className='flex items-center gap-3 m-2'>
                            <ChefHat className="w-10 h-10"/>
                            <h1 className='text-4xl font-bold'>Recipe Generator</h1>
                        </div>
                        <p className='text-green-100'>Tell me what you have, I will make something amazing for you!</p>
                    </div>

                    {/* input section */}
                    <div className='p-8'>
                        <label className='block text-green-500 font-semibold mb-2'>Your Ingredients</label>
                        <div className='mb-4 gap-4'>
                            <div className='flex flex-col md:flex-row gap-2'>
                                <input type="text"
                                value={inputValue}
                                onChange={(e) => setInputValues(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                                placeholder='ex. milk, eggs, flour, etc.'
                                className='flex-1 px-4 py-3 border-2 border-gray-500 rounded-lg focus:border-green-500 focus:outline-none'
                                />
                               <button 
                               onClick={addIngredient}
                               className='flex justify-center items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600'>
                                <Plus className="w-5 h-5"/>Add
                                </button>
                            </div>
                        </div>
                        
                        {/* ingredients list */}
                        
                        {ingredients.length > 0 && (          //conditional rendering - if ingredients array is not empty              
                            <div className='mb-6 flex flex-wrap gap-2'>
                                {ingredients.map((ingredient, index) => ( //map through the ingredients array
                                <span key={index} className='bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2'>
                                {ingredient} 
                                <button 
                                onClick={() => removeIngredient(index)}
                                className='bg-green-500 text-white rounded-full p-1'> 
                                    <X className="w-4 h-4"/>
                                </button> {/*cross button to remove ingredient*/}
                                </span>
                                ))}
                            </div>
                        )}

                        {/* Generate button */}

                        <button 
                        onClick={generateRecipe}
                        disabled={loading || ingredients.length === 0}
                        className='w-full flex justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600'
                        >{loading ? ( 
                            <>
                            <Loader2 className="w-6 h-6 animate-spin"/>
                            Generating your Recipe...
                            </>
                            
                            ) : (
                            <>
                            <ChefHat className="w-6 h-6"/>
                            Generate Recipe
                            </>
                            )
                        }
                        </button>

                        {/* error */}
                        {error && 
                            <div className='mt-4 p-4 bg-red-400 border border-red-400 text-red-700 rounded-lg'>
                                {error}
                            </div>
                        }
                    </div>
                    
                    {/* recipe section */}
                    {recipe && (
                        <div className='p-8 bg-gradient-to-br from-green-50 to-green-100 border-t-4 border-green-200'>
                            <h2 className='text-4xl font-bold mb-4 text-gray-800'>{recipe.title}</h2>
                            <p className='text-gray-700 mb-6'>{recipe.description}</p>

                            <div className='text-sm gap-6 mb-6 flex flex-wrap'>
                                <div className='flex items-center gap-2 text-gray-700'>
                                    <Clock className="w-4 h-4"/>
                                    <span><strong>Prep:</strong> {recipe.prepTime}</span>
                                </div>

                                <div className='flex items-center gap-2 text-gray-700'>
                                    <Clock className="w-4 h-4"/>
                                    <span><strong>Cooking:</strong> {recipe.cookTime}</span>
                                </div>

                                <div className='flex items-center gap-2 text-gray-700'>
                                    <Users className="w-4 h-4"/>
                                    <span><strong>Servings:</strong> {recipe.servings}</span>
                                </div>
                            </div>

                            <div className='grid md:grid-cols-2 gap-6'>
                                <div className='bg-white p-6 rounded-lg shadow'>
                                    <h3 className='text-xl font-bold text-green-600 mb-4'>Ingredients</h3>
                                    <ul className='space-y-2'>
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <li key={index} className='flex items-center gap-2 text-gray-700'>
                                                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                                                <span>{ingredient}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className='bg-white p-6 rounded-lg shadow'>
                                    <h3 className='text-xl font-bold text-green-600 mb-4'>Instructions</h3>
                                    <ol className='space-y-3'>
                                        {recipe.instructions.map((instruction, index) => (
                                            <li key={index} className='text-gray-700 flex gap-3'>
                                                <span className='bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>{index + 1}</span>
                                                <span>{instruction}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home