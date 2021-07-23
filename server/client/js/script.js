/**
 * Socket and data
 * */
const socket = io()

// our data
const questionData = [
	{label: 'What would your film flashbacks be on your deathbed?', index: 1},
	{label: 'Why is \'death\' considered a spoiler?', index: 2},
	{label: 'Has the portrayal of death in film skewed our expectations of death in reality?', index: 3},
	{label: 'How could directors/actors/script-writers better represent death on screen?', index: 4},
	{label: 'When was the last time seeing death in film made you think about death in your own life?', index: 5},
	{label: 'What is an unhelpful way to represent loss in film for children?', index: 6},
	{label: 'What would your ideal film death be?', index: 7},
	{label: 'How could directors/actors/script-writers better represent death on screen?', index: 8}
]

// someone clicked spin
const initSpin =() => socket.emit('spin', questionData.length)

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
const centerRadius = radius / 4
const initialRotation = 90 // turn the whole thing 90* clockwise to align with the pointer
const labelLength = 190


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
	.attr('class', 'pie')
	.on("click", initSpin)

// set up some ugly colours
const color = d3.scaleOrdinal()
	.domain(questionData)
	.range(['#888888', '#bebebe', '#6d6d6d'])

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
			.innerRadius(centerRadius)
			.outerRadius(radius)
	)
	.attr('fill', d => color(d.index - 1))
	.attr('stroke', 'black')
	.attr('stroke-width', '1px')
	//.style('opacity', 0.7)
	
// add labels
$slices
	.append('text')
	.attr('transform', d => `rotate(${(d.angle * 180 / Math.PI - 90)})translate(${(radius / 4) + 20})`)
	.attr('text-anchor', 'start')
	.text(d => d.data.label)
	.each(function(){

		// snip question text to fit within spinner, adding ellipsis if need be
		const self = d3.select(this)
		let text = self.text()
		let textLength = self.node().getComputedTextLength()

		while(textLength > labelLength){

			text = text.slice(0, -1)
			self.text(text + '...')
			textLength = self.node().getComputedTextLength()

		}

	})


// add our skull button
const skullDimension = (centerRadius * 2) - 10

const $skull = $pie
	.append('svg')
	.attr('viewBox', `-${skullDimension / 4} 0 ${skullDimension * 2} ${skullDimension * 2}`)
	.attr('width', skullDimension)
    .attr('height', skullDimension)
	// position at center, and counteract starting rotation so skull starts right way up!
	.attr('transform', `rotate(-${initialRotation})translate(-${skullDimension / 2}, -${skullDimension / 2})`)

$skull.append('path')
	.attr('class', 'skull')
	.attr('d', `M 202.94995,96.8 C 200.64995,43 156.24995,0 101.84995,0 47.449945,0 3.0499452,42.9 0.74994523,96.8 c -3.40000003,24.5 5.79999997,45.8 6.89999997,51.9 1.1,6 8.8999998,24.2 9.2999998,32 0.3,6.8 1.4,17.1 9.5,18.8 2.5,0.5 4.5,2.6 4.9,5.2 3,18.6 7.7,47.6 7.7,51.5 0,4.3 2.1,9.3 7.8,11.7 5.7,2.5 15.6,8.8 23.5,13.9 5,3.2 17.9,8.9 31.600005,5 13.6,3.9 26.6,-1.8 31.6,-5 7.9,-5.1 17.8,-11.4 23.5,-13.9 5.7,-2.5 7.8,-7.5 7.8,-11.7 0,-3.9 4.7,-32.9 7.7,-51.5 0.4,-2.6 2.3,-4.7 4.9,-5.2 8,-1.6 9.1,-11.9 9.5,-18.8 0.4,-7.8 8.2,-26 9.3,-32 0.9,-6.1 10.1,-27.4 6.7,-51.9 z m -57,-63.1 c 0,-0.6 0.7,-1 1.2,-0.7 l 15.5,10.4 c 0.3,0.2 0.4,0.5 0.3,0.8 l -3.4,14.8 c -0.1,0.5 -0.8,0.8 -1.2,0.5 l -12.1,-8.7 c -0.2,-0.1 -0.3,-0.4 -0.3,-0.6 z m 18.9,36.1 c 0,3.7 -3,6.8 -6.8,6.8 -3.8,0 -6.8,-3 -6.8,-6.8 0,-3.7 3,-6.8 6.8,-6.8 3.8,0 6.8,3.1 6.8,6.8 z m -32.1,-1.5 7.5,-7.5 c 0.3,-0.3 0.8,-0.3 1.1,0 l 6.1,5.8 c 0.3,0.3 0.3,0.7 0.1,1.1 l -4.6,5.8 c -0.2,0.3 -0.6,0.4 -0.9,0.2 l -9,-4.1 c -0.6,-0.3 -0.7,-0.9 -0.3,-1.3 z m 2.9,15.4 c 0.1,-0.3 0.3,-0.4 0.6,-0.5 l 17.3,-3.9 c 0.5,-0.1 1,0.3 1,0.8 l -0.4,13.2 c 0,0.4 -0.3,0.7 -0.7,0.8 l -21.2,3 c -0.6,0.1 -1.1,-0.5 -0.9,-1 z M 92.549945,22.8 101.04995,11.1 c 0.4,-0.5 1.2,-0.5 1.6,0 l 8.5,11.7 c 0.3,0.4 0.2,1 -0.1,1.3 l -8.5,8.1 c -0.4,0.4 -1,0.4 -1.4,0 l -8.500005,-8.1 c -0.3,-0.3 -0.4,-0.9 -0.1,-1.3 z m -15.1,14.3 c 9.3,-6 18.4,0.3 23.500005,8.5 0.5,0.7 1.5,0.7 2,0 5,-8.2 14.1,-14.5 23.5,-8.5 9.9,6.3 6.4,26.2 -23.6,43.4 -0.5,0.3 -1.1,0.3 -1.6,0 C 70.949945,63.3 67.549945,43.4 77.449945,37.1 Z m 24.400005,107.1 c 3.5,-0.2 6.3,-1.9 10.6,11.9 4.3,13.9 13.2,19.7 8.5,28.8 -3.9,7.7 -11.5,8.5 -16.6,4.7 -1.5,-1.1 -3.6,-1.1 -5.100005,0 -5.1,3.8 -12.7,3 -16.6,-4.7 -4.6,-9.1 4.3,-14.9 8.5,-28.8 4.4,-13.8 7.2,-12.1 10.700005,-11.9 z m -8.400005,-41 7.600005,-10.3 c 0.4,-0.5 1.2,-0.5 1.6,0 l 7.6,10.3 c 0.2,0.3 0.3,0.7 0.1,1.1 l -7.6,14.6 c -0.4,0.7 -1.4,0.7 -1.8,0 l -7.600005,-14.6 c -0.1,-0.4 -0.1,-0.8 0.1,-1.1 z m -21.8,-6.1 -21.2,-3 c -0.4,-0.1 -0.7,-0.4 -0.7,-0.8 l -0.4,-13.2 c 0,-0.5 0.5,-0.9 1,-0.8 l 17.3,3.9 c 0.3,0.1 0.5,0.3 0.6,0.5 l 4.4,12.3 c 0,0.6 -0.4,1.2 -1,1.1 z m -8.1,-36.3 7.5,7.5 c 0.4,0.4 0.3,1 -0.2,1.3 l -9,4.1 c -0.3,0.2 -0.7,0.1 -0.9,-0.2 l -4.6,-5.8 c -0.3,-0.3 -0.2,-0.8 0.1,-1.1 l 6.1,-5.8 c 0.2,-0.3 0.7,-0.3 1,0 z m -22.4,-17.4 15.5,-10.4 c 0.5,-0.4 1.2,0 1.2,0.7 v 16.5 c 0,0.3 -0.1,0.5 -0.3,0.6 l -12.1,8.7 c -0.5,0.3 -1.1,0.1 -1.2,-0.5 l -3.4,-14.8 c -0.1,-0.3 0,-0.6 0.3,-0.8 z m 4.5,19.6 c 3.7,0 6.8,3 6.8,6.8 0,3.7 -3,6.8 -6.8,6.8 -3.7,0 -6.8,-3 -6.8,-6.8 0.1,-3.7 3.1,-6.8 6.8,-6.8 z m -25.3,-0.1 10.6,-6.8 c 0.5,-0.3 1.1,0 1.2,0.5 l 2.2,12.9 c 0.1,0.3 -0.1,0.6 -0.4,0.8 l -10.1,6 c -0.5,0.3 -1.1,0 -1.2,-0.5 l -2.7,-12.1 c 0,-0.3 0.1,-0.6 0.4,-0.8 z m 0.5,42.7 V 88.5 c 0,-0.3 0.2,-0.6 0.5,-0.7 l 15.5,-5.7 c 0.5,-0.2 1,0.2 1.1,0.7 l 0.9,12.2 c 0,0.3 -0.1,0.6 -0.4,0.7 l -16.4,10.6 c -0.5,0.3 -1.2,-0.1 -1.2,-0.7 z m 12.5,48.4 c -5.2,-3.8 -6.6,-15.2 -8.1,-21.8 -1.4,-6.6 1.7,-13.8 5.7,-17.1 4,-3.3 12.6,-7.4 25.6,-9.3 13,-1.9 22.1,-1.1 24,8.1 1.4,7.1 1,22.3 -1.4,27.8 -2.4,5.5 -17.1,13.8 -26.4,16.4 -9.4,2.6 -14.2,-0.3 -19.4,-4.1 z m 39.2,63.1 c -0.2,1.5 -0.9,2.9 -0.8,4.3 0.1,1.9 -2.4,2.2 -3.3,0.9 -0.2,-0.3 -0.6,-0.5 -1,-0.4 -1.1,0.1 -2.4,-0.8 -2.1,-2.2 0.7,-2.9 1.2,-5.4 3.8,-7.3 0.6,-0.4 1.7,-0.2 2.2,0.3 1.1,1.3 1.5,2.7 1.2,4.4 z m -9.7,-52.8 -6.4,14.3 c -0.2,0.5 -0.9,0.7 -1.3,0.4 l -12.3,-8.5 c -0.6,-0.4 -0.5,-1.4 0.2,-1.6 l 18.7,-5.8 c 0.8,-0.2 1.4,0.5 1.1,1.2 z m -17.3,50.9 c -3.2,-10 -5.7,-21.9 -4.6,-31.3 13,5.7 16,8.9 16.5,15.1 0.5,6.2 3.7,11 2.8,14.6 -0.9,3.6 -3.6,6.9 -1.2,9.3 0.3,0.3 0.7,0.6 1.2,1 0.2,0.1 0.6,0.4 0.3,1.3 -0.7,2.7 -0.7,5.6 -0.5,8.5 0,0.5 -0.6,0.9 -0.9,0.7 -0.7,-0.6 -1.3,-1.1 -1.7,-1.4 -2.1,-1.6 -8.7,-7.8 -11.9,-17.8 z m 25.2,48.3 -12.4,-2.6 c -0.3,-0.1 -0.6,-0.3 -0.7,-0.6 l -6.1,-18.1 c -0.3,-0.8 0.6,-1.5 1.3,-1.1 l 12.2,7.2 c 0.2,0.1 0.3,0.2 0.4,0.4 l 6.3,13.6 c 0.3,0.6 -0.3,1.3 -1,1.2 z m 1.2,-21.2 c -2.7,-1 -5.3,-2.5 -7.5,-4 -0.2,-0.2 -0.4,-0.4 -0.4,-0.7 -0.2,-1.7 -0.4,-3.3 -0.4,-5 0,-1.5 0,-3.4 0.2,-5.2 0.1,-0.6 0.8,-1 1.4,-0.7 1.7,0.8 3.6,1.6 5.4,2.2 0.4,0.1 0.6,0.5 0.7,0.8 0.2,2.4 0.8,4.9 1.2,7.3 0.2,1.4 0.5,2.7 0.7,4.1 0.1,0.9 -0.6,1.5 -1.3,1.2 z m 11.8,0.2 c 0,0.5 -0.4,0.9 -0.8,0.9 -1.6,0.2 -3.1,0.3 -5,0.2 -0.4,0 -0.8,-0.4 -0.8,-0.8 -0.3,-1.5 -0.6,-2.9 -0.8,-4.4 -0.4,-2.6 -1.3,-5.6 -1.5,-8.4 0.1,0 0.1,0 0.2,0 1.7,0.2 4.5,0.2 7.7,0.3 0.5,0 0.9,0.4 0.9,0.9 0.1,2.8 0.2,5.5 0.2,8.3 -0.1,0.9 -0.1,1.9 -0.1,3 z m 0.2,-18.1 c -0.2,0.1 -0.4,0.3 -0.6,0.4 -0.5,0.2 -1.2,0.3 -1.7,0 -0.2,-0.1 -0.4,-0.1 -0.6,-0.1 -0.2,0 -0.3,0 -0.5,0 -0.3,0 -0.6,0 -0.9,0.2 -1.2,0.7 -3.2,-0.9 -2.4,-2.6 1.3,-2.8 0,-8.4 4.3,-9.1 0.5,-0.1 1,0 1.4,0.3 0.3,0 0.6,0.1 0.9,0.2 3.1,1.7 2.9,6.4 3,9.4 0,1.7 -1.9,2.2 -2.9,1.3 z m 11.6,14.2 c -0.1,0.8 -0.2,1.7 -0.3,2.7 -0.1,0.5 -0.4,0.8 -0.9,0.8 -2.4,0.1 -4.4,0.3 -6,0.5 -0.6,0.1 -1.1,-0.4 -1.1,-1 0,-1.2 0.1,-2.4 0.1,-3.4 0,-2.3 0,-4.7 -0.1,-7 0,-0.5 0.4,-1 0.9,-1 2.4,0 4.8,-0.1 7,-0.1 0.5,0 1,0.4 1,1 -0.1,2.5 -0.3,5 -0.6,7.5 z m 2.1,-12.6 c -0.3,-0.2 -0.7,-0.3 -1.1,-0.2 -0.6,0.2 -1.2,0.1 -1.8,-0.4 -0.1,-0.1 -0.1,-0.1 -0.1,-0.2 -1.1,0.5 -2.7,0 -2.5,-1.5 0.4,-3 -0.3,-6 2,-8.4 0.3,-0.3 0.8,-0.5 1.3,-0.5 0.7,-0.4 1.7,-0.3 2.2,0.3 2.400005,2.4 2.2,6 2.800005,9.1 0.3,1.7 -1.700005,2.6 -2.800005,1.8 z m 8.600005,16 c -1.3,0 -2.8,-0.1 -4.4,-0.1 -0.7,0 -1.3,0 -1.900005,0 -0.6,0 -1,-0.5 -1,-1 0.1,-1.2 0.2,-2.4 0.3,-3.5 0.2,-2.1 0.4,-4.3 0.4,-6.4 0,-0.5 0.400005,-0.9 0.900005,-0.9 0.5,0 0.9,0 1.2,0 0,0 0,0 0.1,0 1,0 2.4,0.1 4.2,0.1 0.5,0 0.9,0.4 0.9,1 0,3.3 0.1,6.6 0.2,9.9 0.1,0.4 -0.3,0.9 -0.9,0.9 z m 1.7,-16.1 c -0.3,-0.1 -0.6,-0.2 -0.9,-0.1 -1.1,0.4 -2.7,-0.6 -2.5,-2.2 -0.1,0.3 0,0.1 0,-0.3 0,-0.3 0.1,-0.6 0.1,-0.9 0.1,-0.8 0.2,-1.6 0.3,-2.4 0.2,-1.4 0.5,-3 1.5,-4.1 1.4,-1.4 3.2,-0.6 4.2,0.8 0.7,1.1 0.8,2.3 1.1,3.5 0.2,1.2 0.6,2.2 0.8,3.4 0,0.2 0.1,0.3 0.1,0.5 v 0.4 c 0,1.4 -1.4,2 -2.4,1.6 -0.3,-0.1 -0.5,-0.1 -0.8,0 -0.5,0.1 -1,0 -1.5,-0.2 z m 10.7,16.1 c 0,0.6 -0.5,1 -1.1,0.9 -1.6,-0.2 -3.5,-0.5 -5.9,-0.7 -0.5,0 -0.9,-0.5 -0.9,-1 0,-0.3 0,-0.6 0,-0.8 0,-3.1 -0.1,-6.2 -0.2,-9.3 0,-0.5 0.4,-1 1,-1 2,0 4.1,0 6.2,0.1 0.5,0 0.9,0.4 0.9,0.9 0.2,3.7 0.3,7.3 0,10.9 z m 2.4,-17 c -0.4,-0.2 -0.8,-0.3 -1.2,-0.1 -1.3,0.7 -3.3,-0.3 -2.6,-1.9 1.2,-2.8 0.1,-7 2.8,-9.1 1.9,-1.4 4,0 5,1.8 0.6,1.1 0.8,2.3 0.8,3.6 0,1 -0.3,2.3 0.2,3.2 0.9,1.6 -0.9,3 -2.2,2.5 -0.3,-0.1 -0.7,-0.1 -1,0.1 -0.6,0.3 -1.3,0.2 -1.8,-0.1 z m 10.2,17.5 c -1,0.3 -2.1,0.6 -3.1,0.8 -2,0.3 -3.6,0.4 -5.1,0.3 -0.5,0 -0.9,-0.5 -0.9,-1 0.3,-3.8 0.2,-7.6 0.1,-11.4 0,-0.5 0.4,-1 0.9,-1 2.3,0 4.3,-0.1 5.6,-0.2 0.3,0 0.7,-0.1 1,-0.1 0.5,-0.1 1,0.2 1.1,0.7 0.6,2.3 1.2,4.6 1.2,7.1 0,1.4 -0.1,2.8 -0.3,4.1 0,0.3 -0.2,0.6 -0.5,0.7 z m 6,-21.2 c -0.3,0.2 -0.7,0.2 -1.1,0.2 -0.5,0.4 -1.3,0.5 -1.8,0.2 -0.7,0.9 -2.2,1.1 -2.9,-0.2 -1,-1.9 -0.8,-5.9 1.2,-7.1 1.4,-0.9 3,-0.2 3.9,1.1 0.4,0.6 0.7,1.4 0.9,2.1 0.1,0.3 0.2,0.7 0.4,1 0.1,0.1 0.4,0.9 0.1,0.4 0.3,0.7 0.2,1.8 -0.7,2.3 z m 4.6,10.5 c 0.3,1.2 0.5,2.4 0.7,3.6 0.1,0.3 -0.1,0.7 -0.4,0.9 -1.5,1.1 -3.2,2.4 -5.1,3.5 -0.7,0.4 -1.5,-0.1 -1.4,-0.9 0,0 0,0 0,0 0.1,-2.2 0,-4.4 -0.4,-6.6 -0.2,-0.9 -0.4,-1.9 -0.7,-2.8 -0.2,-0.5 0.1,-1 0.6,-1.2 1.3,-0.5 2.6,-1.1 3.8,-1.7 0.5,-0.2 1.1,0 1.3,0.5 0.5,1.5 1.2,3 1.6,4.7 z m 0.1,-68.7 18.7,5.8 c 0.7,0.2 0.9,1.2 0.2,1.6 l -12.3,8.5 c -0.5,0.3 -1.1,0.1 -1.3,-0.4 l -6.4,-14.3 c -0.3,-0.7 0.4,-1.4 1.1,-1.2 z m 10.2,79.1 -6.1,18.1 c -0.1,0.3 -0.4,0.5 -0.7,0.6 l -12.4,2.6 c -0.7,0.2 -1.3,-0.6 -1,-1.2 l 6.3,-13.6 c 0.1,-0.2 0.2,-0.3 0.4,-0.4 l 12.2,-7.2 c 0.8,-0.4 1.6,0.3 1.3,1.1 z m 6,-27 c -2.8,8.6 -8.1,14.4 -10.8,16.9 -0.9,0.8 -1.9,-0.4 -2.1,-1.2 -0.4,-1.7 -1.1,-3.3 -1.8,-4.9 -0.1,-0.3 -0.2,-2 0.1,-2.1 0.4,-0.3 0.8,-0.6 1.1,-0.9 2.3,-2.3 -0.4,-5.7 -1.2,-9.3 -0.8,-3.6 2.3,-8.4 2.8,-14.6 0.5,-6.2 3.6,-9.4 16.5,-15.1 1.1,9.3 -1.4,21.3 -4.6,31.2 z m 20.4,-83 c -1.4,6.6 -2.8,18 -8.1,21.8 -5.2,3.8 -10.1,6.6 -19.4,4 -9.3,-2.6 -24,-10.9 -26.4,-16.4 -2.4,-5.5 -2.8,-20.6 -1.4,-27.8 1.8,-9.1 10.9,-10 24,-8.1 13,1.9 21.6,5.9 25.6,9.3 4,3.4 7.1,10.5 5.7,17.2 z m 4.3,-26.6 c 0,0.6 -0.7,1 -1.2,0.7 l -16.4,-10.6 c -0.2,-0.2 -0.4,-0.4 -0.4,-0.7 l 0.9,-12.2 c 0,-0.5 0.6,-0.9 1.1,-0.7 l 15.5,5.7 c 0.3,0.1 0.5,0.4 0.5,0.7 z m 0.9,-41.9 -2.7,12.1 c -0.1,0.5 -0.7,0.8 -1.2,0.5 l -10.1,-6 c -0.3,-0.2 -0.4,-0.5 -0.4,-0.8 l 2.2,-12.9 c 0.1,-0.6 0.7,-0.8 1.2,-0.5 l 10.6,6.8 c 0.4,0.2 0.5,0.5 0.4,0.8 z`)
	

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
		.on('start', () => displayQuestion(''))
		.on('end', () => displayQuestion(`"${sliceToSpinTo.data.label}"`))

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
const displayQuestion = text => display.textContent = text

/**
 * Utils
 */

const radtoDegrees = rad => rad * (180 / Math.PI)
const randomInRange = (min, max) => (Math.random() * (max - min)) + min
