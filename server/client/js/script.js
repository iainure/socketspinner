/**
 * Socket and data
 * */
const socket = io()

// our data
const questionData = [
	{label: 'Question 1', index: 1},
	{label: 'Question 2', index: 2},
	{label: 'Question 3', index: 3},
	{label: 'Question 4', index: 4},
	{label: 'Question 5', index: 5},
	{label: 'Question 6', index: 6},
	{label: 'Question 7', index: 7},
	{label: 'Question 8', index: 8},
	{label: 'Question 9', index: 9},
	{label: 'Question 10', index: 10},
	{label: 'Question 11', index: 11},
	{label: 'Question 12', index: 12}
]

// someone clicked spin
const spin =() => socket.emit('spin', questionData.length)

// server returns a target to land on
socket.on('spun', index => spinIt(index))
socket.on('startAt', index => spinIt(index, false)) // when you first load the page, set spinner to current position


/**
 * Creating the pie
 * */

const width = 800
const height = 650

const spinDuration = 5000
const radius = 300
const initialRotation = 90 // turn the whole thing 90* clockwise to align with the pointer

let pieAngle // work this out as we pie-ify our data, as we need it to work out starting rotation

// create a pie-ifying function
const pie = d3.pie()
	.value(() => 1)

// enhance our data with properties we need
const prepareData = data => {

	// convert to pie-ified data
	const piedData = pie(data)

	// calculate our angle
	piedData.forEach(d => d.angle =  (d.startAngle + d.endAngle) / 2)
	return piedData

}

const preparedData = prepareData(questionData)

const $svg = d3.select('#spinner')
	.append('svg')
	.data([questionData])
	.attr('width', width)
	.attr('height', height)

// create container and position at center of SVG
const $container = $svg.append('g')
	.attr('transform', `translate(${width / 2}, ${radius + 20})`)

// create a pie element, which will appear at 0,0 in the container
const $pie =  $container.append('g')
	.attr('transform', `rotate(${initialRotation})`) 

// set up some ugly colours
const color = d3.scaleOrdinal()
	.domain(questionData)
	.range(['#1167b1', '#187bcd', '#2a9df4', '#d0efff'])

// build our slices
const $slices = $pie
	.selectAll('.slice')
	.data(preparedData)
	.join('g')
		.attr('class', 'slice')

// draw the slice
$slices
	.append('path')
	.attr(
		'd',
		d3.arc()
			.innerRadius(20)
			.outerRadius(radius)
	)
	.attr('fill', d => color(d.index - 1))
	.attr('stroke', 'black')
	.attr('stroke-width', '1px')
	//.style('opacity', 0.7)
	
// add labels
$slices
	.append('text')
	.attr('transform', d => `rotate(${(d.angle * 180 / Math.PI - 90)})translate(${(radius - 20)})`)
	.attr('text-anchor', 'end')
	.text(d => d.data.label)


/**
 * Spinning it
 * */

const minRotations = 5
const maxRotations = 20

const spinIt = (newIndex, animate = true) => {

	const sliceToSpinTo = preparedData.find(item => item.data.index == newIndex)
	console.log(sliceToSpinTo)

	// what is our end rotation target
	const rotateToTarget = 360 -  radtoDegrees(randomInRange(sliceToSpinTo.startAngle, sliceToSpinTo.endAngle))

	// get a random distance to spin before we land
	const randomSpins = randomInRange(minRotations, maxRotations)
	
	// our starting rotation position, plus some random 360s, plus the rotation to actually reach our targeted slice
	let rotateTo = initialRotation + (Math.floor(randomSpins) * 360) + rotateToTarget

	const tween = (allData, i, el) => {

		let startingRotation
		
		// a little bit of a quick fix for extracting the rotation value, so lets have a fallback
		try {
			startingRotation = parseFloat(d3.select(el[0]).attr("transform").match(/\d+\.?\d*/))
			startingRotation = startingRotation - (Math.floor(startingRotation / 360) * 360) // remove our random spins from last time
		}

		catch(err){
			startingRotation = 90
		}

		return d3.interpolateString(`rotate(${startingRotation})`, `rotate(${rotateTo})`)

	}

	$pie
		.transition()
		.duration(animate ? spinDuration : 0)
		.attrTween('transform', tween)
		.on('end', () => displayQuestion(sliceToSpinTo.data.label))

}


/**
 *  Creating the arrow
 * */

 $container
	.append('path')
	.attr('d', `M ${radius} 0 h 200`)
	.attr('stroke', 'black')
	.attr('stroke-width', '3px')


/**
 * Display the question
 */

const display = document.querySelector('.questionDisplay')
const displayQuestion = text => display.textContent = `"${text}"`

/**
 * Utils
 */

const radtoDegrees = rad => rad * (180 / Math.PI)
const randomInRange = (min, max) => (Math.random() * (max - min)) + min
