
class KDtree {

    static computeEdges(tree, { minX, maxX, minY, maxY }) {
        function computeBounds(edge) {
            const { startX, startY, endX, endY } = edge
            let leftBound = {
                minX,
                maxX: endX,
                minY,
                maxY: endY
            }

            let rightBound = {
                minX: startX,
                maxX,
                minY: startY,
                maxY
            }

            return { leftBound, rightBound }
        }

        let edges = []
        if (tree.median == null) {
            return edges
        }

        const { median, left, right, axis } = tree
        if (axis == 0) {
            edges = [{
                startX: median.x,
                startY: minY,
                endX: median.x,
                endY: maxY
            }]
        } else {
            edges = [{
                startX: minX,
                startY: median.y,
                endX: maxX,
                endY: median.y
            }]
        }

        const { leftBound, rightBound } = computeBounds(edges[0])
        edges = edges.concat(
            KDtree.computeEdges(left, leftBound),
            KDtree.computeEdges(right, rightBound),
        )

        return edges
    }

    static getTotalDepth(tree) {
        if (tree.median == null) {
            return tree.depth
        }

        let leftDepth = KDtree.getTotalDepth(tree.left)
        let rightDepth = KDtree.getTotalDepth(tree.right)

        let depth = (leftDepth >= rightDepth) ? leftDepth : rightDepth
        return depth
    }

    static filteByDepth(tree, depth) {
        if (tree.depth == depth && tree.median == null) {
            return []
        }

        if (tree.depth == depth && tree.median != null) {
            return [tree.median]
        }

        let result = []
        if (tree.depth < depth && tree.median != null) {
            result = result.concat(
                KDtree.filteByDepth(tree.left, depth),
                KDtree.filteByDepth(tree.right, depth)
            )
        }

        return result
    }

    static partition(datapoints, axis) {
        const comparer = (a, b) => {
            if (axis == 0) {
                return a.x - b.x;
            }
            return a.y - b.y;
        }

        let sortedPoints = datapoints.sort(comparer)
        let mid = Math.floor(datapoints.length / 2)

        return {
            median: sortedPoints[mid],
            left: sortedPoints.slice(0, mid),
            right: sortedPoints.slice(mid, datapoints.length)
        }
    }

    constructor(datapoints, leafsize = 10, depth = 0) {
        this.axis = depth % 2
        this.depth = depth
        if (datapoints.length >= leafsize) {
            const { median, left, right } = KDtree.partition(datapoints, this.axis)
            this.median = median
            this.left = new KDtree(left, leafsize, depth + 1)
            this.right = new KDtree(right, leafsize, depth + 1)
        } else {
            this.datapoints = datapoints
            this.left = null
            this.right = null
            this.median = null
        }
    }
}



let dataPoints = [];
let pointNum = 200;
let edges = []
let tree;
let totalDepth = 0;
let leafsize = 4

const fullDisplay = (sketch) => {

    sketch.setup = () => {
        sketch.createCanvas(400, 400)
        for (i = 0; i < pointNum; i++) {
            let x = Math.floor(sketch.random(10, 390))
            let y = Math.floor(sketch.random(10, 390))

            dataPoints[i] = { x, y }
        }

        tree = new KDtree(dataPoints, leafsize)

        edges = KDtree.computeEdges(tree, {
            minX: 0, maxX: 400, minY: 0, maxY: 400
        })

        totalDepth = KDtree.getTotalDepth(tree)
        console.log(totalDepth)
    }

    sketch.draw = () => {
        sketch.background(220);
        sketch.stroke('purple');
        sketch.strokeWeight(4);

        for (i = 0; i < pointNum; i++) {
            sketch.point(dataPoints[i].x, dataPoints[i].y);
        }

        sketch.strokeWeight(1);
        sketch.stroke('green');
        for (edge of edges) {
            const { startX, startY, endX, endY } = edge
            sketch.line(startX, startY, endX, endY)
        }
    }
}


// Partial Display Variable
let filtedPoints = []
let partialDepth = 4
let partialTree
let partialEdges = []

const partialDisplay = (sketch) => {
    sketch.setup = () => {
        sketch.createCanvas(400, 400)
        filtedPoints = KDtree.filteByDepth(tree, partialDepth)
        partialTree = new KDtree(filtedPoints, leafsize)
        partialEdges = KDtree.computeEdges(partialTree, {
            minX: 0, maxX: 400, minY: 0, maxY: 400
        })
        console.log(filtedPoints)
        console.log(partialTree)
    }

    sketch.draw = () => {
        sketch.background(220);
        sketch.stroke('purple');
        sketch.strokeWeight(5);

        for (const point of filtedPoints) {
            sketch.point(point.x, point.y);
        }

        sketch.strokeWeight(1);
        sketch.stroke('red');
        for (edge of partialEdges) {
            const { startX, startY, endX, endY } = edge
            sketch.line(startX, startY, endX, endY)
        }
    }
}


const fullP5 = new p5(fullDisplay, 'fullDisplay')
const partialP5 = new p5(partialDisplay, 'partialDisplay')