const cocoSsd = {
    load: () => new Promise(resolve => {
        resolve({
        detect: () => new Promise(r => r(Math.random() > 0.999 ? [{bbox: [100,600,100,100], class: "person", score: 0.99}] : []))
        })
    })
}
console.log("MOCK COCOSSD")
export default cocoSsd