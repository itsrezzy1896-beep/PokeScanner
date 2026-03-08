let cards = []

const input = document.getElementById("camera")
const preview = document.getElementById("preview")
const cardsDiv = document.getElementById("cards")

input.addEventListener("change", async function(e){

const file = e.target.files[0]
preview.src = URL.createObjectURL(file)

cardsDiv.innerHTML = "Scanning image..."

const worker = await Tesseract.createWorker()

await worker.loadLanguage("eng+jpn")
await worker.initialize("eng")

const { data } = await worker.recognize(file)

await worker.terminate()

const text = data.text.toLowerCase()

const detectedNames = detectPokemonNames(text)

if(detectedNames.length === 0){

cardsDiv.innerHTML = "No Pokemon detected"

return

}

for(let name of detectedNames){

let card = await lookupCard(name)

cards.push(card)

}

renderCards()

})

function detectPokemonNames(text){

const pokemon = [
"pikachu","charizard","mew","mewtwo","gardevoir","rayquaza",
"dragapult","ursaluna","aerodactyl","iron thorns","scream tail",
"lucario","blastoise","venusaur","gyarados","alakazam",
"machamp","snorlax","gengar","tyranitar"
]

let found = []

for(let p of pokemon){

if(text.includes(p)){

found.push(p)

}

}

return found

}

async function lookupCard(name){

try{

const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${name}`)

const data = await response.json()

const c = data.data[0]

return {

cardmarketId:"",
name:c.name,
set:c.set.name,
number:c.number

}

}catch{

return{

cardmarketId:"",
name:name,
set:"Unknown",
number:""

}

}

}

function renderCards(){

cardsDiv.innerHTML = "<h3>Detected Cards</h3>"

cards.forEach((c,i)=>{

const row = document.createElement("div")

row.innerText =
(i+1) + ". " +
c.name +
" | " +
c.set +
" | " +
c.number

cardsDiv.appendChild(row)

})

}

function exportCSV(){

let csv =
`cardmarketId,quantity,name,set,cn,condition,language,isFirstEd,isReverseHolo,isSigned,price,comment\n`

cards.forEach(c=>{

csv += `${c.cardmarketId},1,${c.name},${c.set},${c.number},NM,English,,false,,,\n`

})

const blob = new Blob([csv])

const link = document.createElement("a")

link.href = URL.createObjectURL(blob)

link.download = "cardmarket_import.csv"

link.click()

}
