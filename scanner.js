
let cards = []

const input = document.getElementById("camera")
const preview = document.getElementById("preview")
const cardsDiv = document.getElementById("cards")

input.addEventListener("change", async function(e){

const file = e.target.files[0]
preview.src = URL.createObjectURL(file)

// Step 1 OCR recognition (demo)
const worker = await Tesseract.createWorker()
await worker.loadLanguage('eng')
await worker.initialize('eng')

const { data } = await worker.recognize(file)

await worker.terminate()

// crude card name detection example
let detectedName = detectName(data.text)

if(!detectedName){
detectedName = "Unknown Card"
}

// Step 2 lookup card from API
let card = await lookupCard(detectedName)

cards.push(card)

renderCards()

})

function detectName(text){

text = text.toLowerCase()

const names = [
"pikachu","charizard","dragapult","mew","mewtwo","gardevoir",
"blastoise","venusaur","lucario","rayquaza"
]

for(let n of names){
if(text.includes(n)){
return n
}
}

return null
}

async function lookupCard(name){

try{

const r = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${name}`)
const d = await r.json()

const c = d.data[0]

return {
cardmarketId:"",
name:c.name,
set:c.set.name,
number:c.number
}

}catch{

return {
cardmarketId:"",
name:name,
set:"Unknown",
number:""
}

}

}

function renderCards(){

cardsDiv.innerHTML="<h3>Detected Cards</h3>"

cards.forEach((c,i)=>{

const row=document.createElement("div")

row.innerText=
(i+1)+". "+
c.name+" | "+
c.set+" | "+
c.number

cardsDiv.appendChild(row)

})

}

function exportCSV(){

let csv=`cardmarketId,quantity,name,set,cn,condition,language,isFirstEd,isReverseHolo,isSigned,price,comment\n`

cards.forEach(c=>{

csv+=`${c.cardmarketId},1,${c.name},${c.set},${c.number},NM,English,,false,,,
`

})

const blob=new Blob([csv],{type:"text/csv"})
const link=document.createElement("a")

link.href=URL.createObjectURL(blob)
link.download="cardmarket_import.csv"
link.click()

}
